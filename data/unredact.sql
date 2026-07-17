-- 取消脱敏：仅恢复 description / organizer 真实值（不动坐标等其他字段）
-- 用途：wrangler d1 execute DB --remote --file=data/unredact.sql

UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 1;
UPDATE conventions SET description = '主催QQ：1553797995
社团报名群：cpp申摊', organizer = '洛洛' WHERE id = 2;
UPDATE conventions SET description = '社团报名群：群内申请', organizer = NULL WHERE id = 3;
UPDATE conventions SET description = NULL, organizer = '小卓' WHERE id = 4;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 5;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 6;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = '船长' WHERE id = 7;
UPDATE conventions SET description = '主催QQ：2027527378
社团报名群：cpp申摊', organizer = '微星Weisear' WHERE id = 8;
UPDATE conventions SET description = '官方群号：738520050
主催QQ：1454839784
社团报名群：私聊申请', organizer = '若焉语' WHERE id = 9;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 10;
UPDATE conventions SET description = '官方群号：872049186
主催QQ：3387761870
社团报名群：cpp申摊
进度：1.11截至申摊', organizer = '惊蛰' WHERE id = 11;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = '眷恋' WHERE id = 12;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 13;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 14;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 15;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 16;
UPDATE conventions SET description = '官方群号：1046044511
主催QQ：2453796702
社团报名群：cpp申摊', organizer = '存梦' WHERE id = 17;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 18;
UPDATE conventions SET description = '主催QQ：2042427701
社团报名群：cpp申摊', organizer = '紫音' WHERE id = 19;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 20;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 21;
UPDATE conventions SET description = NULL, organizer = '枫' WHERE id = 22;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 23;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 24;
UPDATE conventions SET description = '官方群号：795293359
主催QQ：1940445253
社团报名群：cpp申摊
进度：1.31', organizer = '页石' WHERE id = 25;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 26;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 27;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 28;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 29;
UPDATE conventions SET description = '官方群号：983438263', organizer = NULL WHERE id = 30;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 31;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = '眷恋' WHERE id = 32;
UPDATE conventions SET description = '官方群号：1044296193
社团报名群：qq群申摊', organizer = NULL WHERE id = 33;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 34;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 35;
UPDATE conventions SET description = '官方群号：515444563
主催QQ：772846264
社团报名群：cpp申摊', organizer = '猫头鱼' WHERE id = 36;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 37;
UPDATE conventions SET description = NULL, organizer = '上海明日方舟ONLY破碎高塔' WHERE id = 38;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 39;
UPDATE conventions SET description = '主催QQ：3452850800', organizer = '克斯' WHERE id = 40;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 41;
UPDATE conventions SET description = '官方群号：1058266685', organizer = '未晓' WHERE id = 42;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = '鸽子球' WHERE id = 43;
UPDATE conventions SET description = '社团报名群：qq加摊', organizer = NULL WHERE id = 44;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 45;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = '青山' WHERE id = 46;
UPDATE conventions SET description = '现场存在大规模其他福袋砸金蛋包场商摊', organizer = '南音' WHERE id = 47;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 48;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = '眷恋' WHERE id = 49;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = '风吹雨' WHERE id = 50;
UPDATE conventions SET description = '官方群号：946422534
主催QQ：879235397
社团报名群：cpp申摊', organizer = '络白' WHERE id = 51;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 52;
UPDATE conventions SET description = '主催QQ：1286749241
社团报名群：cpp申摊', organizer = '小梦' WHERE id = 53;
UPDATE conventions SET description = '官方群号：499542506
主催QQ：2495924645
社团报名群：qq加摊1101493047', organizer = '在野' WHERE id = 54;
UPDATE conventions SET description = '官方群号：361918628
主催QQ：1778944892
社团报名群：cpp申摊', organizer = '洛九霄' WHERE id = 55;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 56;
UPDATE conventions SET description = '5月23号苏州办完被爆出问题说跑路天津办', organizer = '南音' WHERE id = 57;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 58;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 59;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 60;
UPDATE conventions SET description = '官方群号：1029961604
社团报名群：青山', organizer = '小卓' WHERE id = 61;
UPDATE conventions SET description = '官方群号：755840147
主催QQ：1246705115
社团报名群：cpp申摊', organizer = '秦苍' WHERE id = 62;
UPDATE conventions SET description = '主催QQ：3045647992
社团报名群：cpp申摊', organizer = '拾柒' WHERE id = 63;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 64;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 65;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 66;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 67;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 68;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = '馄饨' WHERE id = 69;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 70;
UPDATE conventions SET description = '官方群号：533427579
主催QQ：448271923
社团报名群：cpp申摊', organizer = '小暴' WHERE id = 71;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 72;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 73;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 74;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 75;
UPDATE conventions SET description = '官方群号：459615241
主催QQ：2904209667', organizer = '生汤圆' WHERE id = 76;
UPDATE conventions SET description = '主催QQ：2027527378
社团报名群：cpp申摊', organizer = '微星Weisear' WHERE id = 77;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 78;
UPDATE conventions SET description = '官方群号：994220415
主催QQ：2531923450
社团报名群：cpp申摊', organizer = '松溪' WHERE id = 79;
UPDATE conventions SET description = '官方群号：1097977170
主催QQ：1243982673
社团报名群：qq群加摊', organizer = '星舟文化' WHERE id = 80;
UPDATE conventions SET description = '官方群号：751722322', organizer = NULL WHERE id = 81;
UPDATE conventions SET description = '官方群号：955861586
主催QQ：1269797507
社团报名群：微信群加摊', organizer = '愤怒斯特拉' WHERE id = 82;
UPDATE conventions SET description = '官方群号：1群689323985
2群849379479', organizer = NULL WHERE id = 83;
UPDATE conventions SET description = '官方群号：1群 c
2群 209657615
主催QQ：1717247910
社团报名群：cpp申摊', organizer = '千羽' WHERE id = 84;
UPDATE conventions SET description = '官方群号：872049186
主催QQ：3387761870
社团报名群：cpp申摊
进度：6.27开始申摊', organizer = '惊蛰' WHERE id = 85;
UPDATE conventions SET description = '社团报名群：cpp申摊', organizer = NULL WHERE id = 86;
UPDATE conventions SET description = NULL, organizer = NULL WHERE id = 87;
UPDATE conventions SET description = '官方群号：795293359
主催QQ：1940445253
社团报名群：cpp申摊', organizer = '页石' WHERE id = 88;
UPDATE conventions SET description = NULL, organizer = '。' WHERE id = 89;
UPDATE conventions SET description = '官方群号：922924272
主催QQ：1402589793', organizer = '塞西莉娅' WHERE id = 90;
UPDATE conventions SET description = '官方群号：1033075987', organizer = NULL WHERE id = 91;
UPDATE conventions SET description = '官方群号：1094618859
进度：数调中', organizer = '枫' WHERE id = 92;
