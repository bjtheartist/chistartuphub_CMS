-- Clear all test data from CMS
DELETE FROM postGoals;
DELETE FROM postAssets;
DELETE FROM intelligence;
DELETE FROM goals;
DELETE FROM posts;
DELETE FROM assets;

-- Reset auto-increment counters
ALTER TABLE postGoals AUTO_INCREMENT = 1;
ALTER TABLE postAssets AUTO_INCREMENT = 1;
ALTER TABLE intelligence AUTO_INCREMENT = 1;
ALTER TABLE goals AUTO_INCREMENT = 1;
ALTER TABLE posts AUTO_INCREMENT = 1;
ALTER TABLE assets AUTO_INCREMENT = 1;
