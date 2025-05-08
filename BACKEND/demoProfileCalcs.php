<?php
// Configuration
$STATS_FILE = __DIR__ . '/season3.json';


// $data - Incoming data
// $player - Existing (OR NOT) player data
function updatePlayerStats($data, $suspicious, $isBanned)
{
    global $STATS_FILE;
    $stats = file_exists($STATS_FILE) ? json_decode(file_get_contents($STATS_FILE), true) : ['leaderboard' => []];

    $playerFound = false;
    $isScav = $data['isScav'] ?? false;
    $raidKills = $data['raidKills'] ?? 0;


    foreach ($stats['leaderboard'] as &$player) {
        if ($player['id'] === $data['id']) {
            $playerFound = true;

            $survived = ($data['raidResult'] === 'Survived' || $data['raidResult'] === 'Transit') ? 1 : 0;
            $died = ($data['raidResult'] === 'Killed') ? 1 : 0;

            $player['totalRaids'] += 1;
            $player['damage'] = ($player['damage'] ?? 0) + ($data['raidDamage'] ?? 0);

            // SCAV stats
            if ($isScav && $data['publicProfile']) {
                $player['scavDeaths'] = ($player['scavDeaths'] ?? 0) + $died;
                $player['scavRaids'] = ($player['scavRaids'] ?? 0) + 1;
                $player['scavKills'] = ($player['scavKills'] ?? 0) + $raidKills;
                $player['scavAverageLifeTime'] = calculateNewAverage($player['scavAverageLifeTime'] ?? 0, $player['scavRaids'], $data['raidTime']);
                $player['scavKillToDeathRatio'] = $player['scavDeaths'] > 0 ? round($player['scavKills'] / $player['scavDeaths'], 2) : $player['scavKills'];

                $player['scavSurvived'] = ($player['scavSurvived'] ?? 0) + $survived;

                if ($player['scavRaids'] > 0) {
                    $player['scavSurvivalRate'] = round(($player['scavSurvived'] / $player['scavRaids']) * 100);
                } else {
                    $player['scavSurvivalRate'] = 0; // 0% if no raids
                }

            } else if (!$isScav) {
                // PMC STATS THAT ARE ALWAYS SENT
                $player['survived'] = ($player['survived'] ?? 0) + $survived;
                $player['pmcDeaths'] = ($player['pmcDeaths'] ?? 0) + $died;
                $player['pmcKills'] = ($player['pmcKills'] ?? 0) + $raidKills;
                // Global thingies
                $player['pmcRaids'] = ($player['pmcRaids'] ?? 0) + 1;
                $player['averageLifeTime'] = calculateNewAverage($player['averageLifeTime'] ?? 0, $player['pmcRaids'], $data['raidTime']);
                
                $deaths = max(1, $player['pmcDeaths']);
                $player['killToDeathRatio'] = round($player['pmcKills'] / $deaths, 2);

                if ($player['pmcRaids'] > 0) {
                    $player['survivalRate'] = round(($player['survived'] / $player['pmcRaids']) * 100);
                } else {
                    $player['survivalRate'] = 0; // 0% if no raids
                }
            }

            $updateFields = [
                'name',
                'lastPlayed',
                'pmcLevel',
                'accountType',
                'sptVer',
                'disqualified',
                'publicProfile',
                'registrationDate',
                'currentWinstreak'
            ];

            foreach ($updateFields as $field) {
                if (isset($data[$field])) {
                    $player[$field] = $data[$field];
                }
            }

            // IF PROFILE IS PUBLIC
            if ($data['publicProfile']) {
                // *sigh* since EntryPoint returns this on gz, let's do this...
                $lastMap = "Unknown";

                if ($data['lastRaidMap'] === "east") {
                    $lastMap = "Ground Zero - Low";
                } else if ($data['lastRaidMap'] === "west") {
                    $lastMap = "Ground Zero - High";
                } else {
                    $lastMap = $data['lastRaidMap'];
                }

                $player['profileAboutMe'] = $data['profileAboutMe'] ?? '';
                $player['profilePicture'] = $data['profilePicture'] ?? '';
                $player['profileTheme'] = $data['profileTheme'] ?? '';

                // Last raid stats
                $player['lastRaidEXP'] = $data['lastRaidEXP'];
                $player['isTransition'] = $data['isTransition'];
                $player['lastRaidTransitionTo'] = $data['lastRaidTransitionTo'];
                $player['discFromRaid'] = $data['discFromRaid'];

                $player['lastRaidKills'] = $data['raidKills'];
                $player['lastRaidAs'] = $data['playedAs'];
                $player['lastRaidDamage'] = $data['raidDamage'];
                $player['lastRaidMap'] = $lastMap;
                $player['lastRaidSurvived'] = $survived ? true : false;
                $player['lastRaidTimeSeconds'] = $data['raidTime'];
                $player['lastRaidEXP'] = $data['lastRaidEXP'];
                $player['lastRaidHits'] = $data['lastRaidHits'];
                $player['pmcSide'] = $data['pmcSide'];
                $player['scavLevel'] = $data['scavLevel'];
                $player['prestige'] = $data['prestige'];
                $player['usePrestigeStyling'] = $data['usePrestigeStyling'];
                $player['latestAchievementName'] = $data['latestAchievementName'];
                $player['latestAchievementDescription'] = $data['latestAchievementDescription'];
                $player['latestAchievementImageUrl'] = $data['latestAchievementImageUrl'];
                $player['latestAchievementTimestamp'] = $data['latestAchievementTimestamp'];
            }

            $player['suspicious'] = $suspicious;
            $player['disqualified'] = $isBanned;

            break;
        }
    }

    if (!$playerFound) {
        http_response_code(404);
        die(json_encode(['error' => 'Player not found in stats']));
    }

    file_put_contents($STATS_FILE, json_encode($stats, JSON_PRETTY_PRINT));
    return ['status' => 'updated', 'playerId' => $data['id']];
}

function calculateNewAverage($oldAverage, $totalRaids, $newRaidTime)
{
    if ($totalRaids <= 1) return $newRaidTime;
    return round((($oldAverage * ($totalRaids - 1)) + $newRaidTime) / $totalRaids);
}

function addNewPlayer($data, $trusted, $suspicious, $isBanned)
{
    global $STATS_FILE;
    $stats = file_exists($STATS_FILE) ? json_decode(file_get_contents($STATS_FILE), true) : ['leaderboard' => []];

    $isScav = $data['isScav'] ?? false;
    $raidKills = $data['raidKills'] ?? 0;
    $survived = ($data['raidResult'] === 'Survived') ? 1 : 0;
    $died = ($data['raidResult'] === 'Killed') ? 1 : 0;

    $newPlayer = [
        'id' => $data['id'],
        'name' => $data['name'] ?? '',
        'pmcLevel' => $data['pmcLevel'],
        'lastPlayed' => $data['lastPlayed'] ?? '',
        'damage' => $data['raidDamage'] ?? 0,
        'accountType' => $data['accountType'] ?? 'Standard',
        'sptVer' => $data['sptVer'] ?? 'Unknown',
        'disqualified' => $isBanned,
        'publicProfile' => $data['publicProfile'] ?? false,
        'currentWinstreak' => $data['winRaidStreak'] ?? 0,
        'longestShot' => $data['longestShot'] ?? 0,
        'trusted' => $trusted,
        'suspicious' => $suspicious
    ];

    // Always update
    $newPlayer['pmcRaids'] = 1;
    $newPlayer['averageLifeTime'] = $data['raidTime'] ?? 0;
    $newPlayer['killToDeathRatio'] = $died > 0 ? round($raidKills / $died, 2) : $raidKills;
    $newPlayer['survivalRate'] = $survived ? 100 : 0;


    // IF PROFILE IS PUBLIC
    if ($data['publicProfile']) {
        $newPlayer['profileAboutMe'] = $data['profileAboutMe'] ?? '';
        $newPlayer['profilePicture'] = $data['profilePicture'] ?? '';
        $newPlayer['registrationDate'] = $data['registrationDate'] ?? '';

        // Last raid stats and ach
        $newPlayer['lastRaidKills'] = $data['raidKills'];
        $newPlayer['lastRaidAs'] = $data['playedAs'];
        $newPlayer['lastRaidDamage'] = $data['raidDamage'];
        $newPlayer['lastRaidEXP'] = $data['lastRaidEXP'];
        $newPlayer['isTransition'] = $data['isTransition'];
        $newPlayer['lastRaidTransitionTo'] = $data['lastRaidTransitionTo'];
        $newPlayer['discFromRaid'] = $data['discFromRaid'];
        $newPlayer['latestAchievementName'] = $data['latestAchievementName'];
        $newPlayer['latestAchievementDescription'] = $data['latestAchievementDescription'];
        $newPlayer['latestAchievementImageUrl'] = $data['latestAchievementImageUrl'];
        $newPlayer['latestAchievementTimestamp'] = $data['latestAchievementTimestamp'];
        $newPlayer['lastRaidEXP'] = $data['lastRaidEXP'];
        $newPlayer['lastRaidHits'] = $data['lastRaidHits'];

        if ($data['lastRaidMap'] === "east") {
            $newPlayer['lastRaidMap'] = "Ground Zero - Low";
        } else if ($data['lastRaidMap'] === "west") {
            $newPlayer['lastRaidMap'] = "Ground Zero - High";
        } else {
            $newPlayer['lastRaidMap'] = $data['lastRaidMap'];
        }

        $newPlayer['lastRaidSurvived'] = $survived ? true : false;
        $newPlayer['lastRaidTimeSeconds'] = $data['raidTime'];
        $newPlayer['pmcSide'] = $data['pmcSide'];
        $newPlayer['scavLevel'] = $data['scavLevel'];
        $newPlayer['prestige'] = $data['prestige'];

        // SCAV stats
        if ($isScav) {
            $newPlayer['scavRaids'] = 1;
            $newPlayer['scavKills'] = $raidKills;
            $newPlayer['scavDeaths'] = $died;
            $newPlayer['scavSurvived'] = $survived;
            $newPlayer['scavAverageLifeTime'] = $data['raidTime'] ?? 0;
            $newPlayer['scavKillToDeathRatio'] = $died > 0 ? round($raidKills / $died, 2) : $raidKills;
            $newPlayer['scavSurvivalRate'] = $survived ? 100 : 0;

            // Initialize PMC stats to 0
            $newPlayer['pmcRaids'] = 0;
            $newPlayer['pmcKills'] = 0;
            $newPlayer['pmcDeaths'] = 0;
            $newPlayer['pmcSurvived'] = 0;
            $newPlayer['averageLifeTime'] = 0;
            $newPlayer['killToDeathRatio'] = 0;
            $newPlayer['survivalRate'] = 0;

            // Send this anyways - it won't be updated anyways
        } else {
            // PMC stats
            $newPlayer['pmcRaids'] = 1;
            $newPlayer['pmcKills'] = $raidKills;
            $newPlayer['pmcDeaths'] = $died;
            $newPlayer['survived'] = $survived;
            $newPlayer['averageLifeTime'] = $data['raidTime'] ?? 0;
            $newPlayer['killToDeathRatio'] = $died > 0 ? round($raidKills / $died, 2) : $raidKills;
            $newPlayer['survivalRate'] = $survived ? 100 : 0;

            // Initialize SCAV stats to 0
            $newPlayer['scavRaids'] = 0;
            $newPlayer['scavKills'] = 0;
            $newPlayer['scavDeaths'] = 0;
            $newPlayer['scavSurvived'] = 0;
            $newPlayer['scavAverageLifeTime'] = 0;
            $newPlayer['scavKillToDeathRatio'] = 0;
            $newPlayer['scavSurvivalRate'] = 0;
        }
    }

    $stats['leaderboard'][] = $newPlayer;
    file_put_contents($STATS_FILE, json_encode($stats, JSON_PRETTY_PRINT));

    return ['status' => 'created', 'playerId' => $data['id']];
}
