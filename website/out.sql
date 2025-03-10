PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE user (
	id INTEGER NOT NULL, 
	email VARCHAR(150) NOT NULL, 
	password VARCHAR(150) NOT NULL, 
	person_type VARCHAR(50), 
	PRIMARY KEY (id), 
	UNIQUE (email)
);
INSERT INTO user VALUES(949392911,'jako.kordel@gmail.com','pbkdf2:sha256:1000000$z7BwLQRukDljBLWp$e4719f816494e426d46d3fb843eb1c95341fa28b83b8d9331c2070757d01e5fc','Schüler');
INSERT INTO user VALUES(1290369503,'jako.kordel@gmail.cosm','pbkdf2:sha256:1000000$LB274XDolgZL2Ymv$c43ed6c5315ed694f38e5ba482d60b512a947483b2913a4015270d4afe8f9439','Schüler');
INSERT INTO user VALUES(4679083740,'namensiggi187@gmail.com','pbkdf2:sha256:1000000$mWLfwcpPaEyUql47$fe57f9f90798223ba1e953e9cfe39bee48f9207c03c7b46940d129a4ba1cb93b','Schüler');
INSERT INTO user VALUES(4716443551,'jakos.kordel@gmail.com','pbkdf2:sha256:1000000$eud3eIgau9mGFxW2$5a8e9692731fe6b44b4c908ef6631a3eac8ab5840f3799c12616436a1f40168c','Schüler');
INSERT INTO user VALUES(6663396484,'wissenpfeif@gmail.comasdasasasd','pbkdf2:sha256:1000000$2L9nadnmO5FjKx2A$b4a17f6022cba0d5c6678cb194adeb4bec38ca5b5512eb5c3964252276297528','Schüler');
INSERT INTO user VALUES(8478059530,'wissenpfeif@gmail.comasdasd','pbkdf2:sha256:1000000$kF0eAgprl4VoIto7$042d642ffc32b2b525dd8e994d75f194d65ddf811e3598686644e1cbc2ade938','Schüler');
INSERT INTO user VALUES(8484326606,'jako.ksdfordel@gmail.com','pbkdf2:sha256:1000000$IWurJD6Mm2sqXrAd$2304930cd4f7a1e7a9bc751309dc4a27a1ecffdf1c98c7dbf4e85bfdc5e2213b','Schüler');
INSERT INTO user VALUES(9075929313,'adasdsdfqassad@sa.as','pbkdf2:sha256:1000000$TltZ2877qH3Z2f7V$0494bda62493799db3da0f0113ceb26f78fd6df5fd454f315019cd951e8d0601','Schüler');
INSERT INTO user VALUES(9414328684,'lucas.donath@icloud.com','pbkdf2:sha256:1000000$iBeb8FMh80ReiQhx$2145298a884f843ea13f359ffe8f3e3e4ba21992b2a6b40ebe033e72bccc3d25','Schüler');
CREATE TABLE hausaufgabe (
	id INTEGER NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	description TEXT, 
	deadline VARCHAR(50) NOT NULL, 
	user_id VARCHAR(10) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES user (id)
);
INSERT INTO hausaufgabe VALUES(1,'asdsa','dasdasd','2025-01-12 17:02:00.000000','949392911');
INSERT INTO hausaufgabe VALUES(2,'sdsdf','sasdasd','2025-01-19 17:43:00.000000','949392911');
CREATE TABLE notenrechner (
	id INTEGER NOT NULL, 
	user_id VARCHAR(80) NOT NULL, 
	noten VARCHAR(200), 
	PRIMARY KEY (id)
);
CREATE TABLE fach (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	PRIMARY KEY (id)
);
CREATE TABLE note (
	id INTEGER NOT NULL, 
	note VARCHAR(10) NOT NULL, 
	art VARCHAR(50) NOT NULL, 
	fach_id INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(fach_id) REFERENCES fach (id)
);
CREATE TABLE hausaufgabenheft (
	id INTEGER NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	description TEXT, 
	deadline DATETIME NOT NULL, 
	erledigt BOOLEAN, 
	user_id VARCHAR(10) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES user (id)
);
INSERT INTO hausaufgabenheft VALUES(1,'TEST','','2025-02-01 20:45:34.000000',0,'949392911');
CREATE TABLE users (
	id VARCHAR(10) NOT NULL, 
	email VARCHAR(150) NOT NULL, 
	password VARCHAR(150) NOT NULL, 
	person_type VARCHAR(50), 
	PRIMARY KEY (id), 
	UNIQUE (email)
);
INSERT INTO users VALUES('2958333396','jako.kordel@gmail.com','pbkdf2:sha256:1000000$5U1t8Ma0i3CZHL3w$7eb80a5b824638e069bd6eb23d6515bd645cc127b3edee98ef7a19a7af931f54','Lehrer');
INSERT INTO users VALUES('2218065927','profile@saschakordel.de','pbkdf2:sha256:1000000$zKyUnd6m5TksUiL6$ed397d27b6d859b475a8a0c9e6aee25c88c9b9af9360018881bb67db30f182c2','Schüler');
INSERT INTO users VALUES('9577629403','admin','pbkdf2:sha256:1000000$LrdjjRErOdzHvHdd$d672bcad82733588fde0e38ecf67034af2eb5c424974b9e3e61ce3a1c29c1e70','Schüler');
INSERT INTO users VALUES('1759660131','christiana.kordel@yahoo.de','pbkdf2:sha256:1000000$qrV7Kp1Z1qBeiT3f$467651ea4fc3df1c8eeb5a0f67d8ac5059a25234d59d758d33e2a19552ce40df','Schüler');
INSERT INTO users VALUES('3548467220','jonas.witzel@icloud.com','pbkdf2:sha256:1000000$xUgjjsEXwzhU3wSO$b0679c12a67e1ed274bda72cecacec79ca2dd406a7eb8009412018d170481980','Schüler');
INSERT INTO users VALUES('3344497965','schoolnote','pbkdf2:sha256:1000000$br0zkQpT0OM6iArg$8919ad029a1d99899838ad98f54a795a381a98bc1bd447b4eee9358994f9afed','Schüler');
INSERT INTO users VALUES('0550657942','emil@dehne.budenheim','pbkdf2:sha256:1000000$KPtP9oMC7dJiRXvn$d598e40289345f8fd085ca4e98e0bbb6439586819f537253da293d4c3fb08e08','Schüler');
INSERT INTO users VALUES('4040214508','RMueller','pbkdf2:sha256:1000000$gzqsPdaUXv3pGyup$258fac4a6f443e8d26323b722c5d2d01997063f44604d3aee6c99f14f2d6e19a','Schüler');
INSERT INTO users VALUES('4317427014','leo-kordel@web.de','pbkdf2:sha256:1000000$BzNjpedflklDBaKQ$c024f1b52a515f876c594d77a433917e4b669db46f6d5df7b08d8442f64b6630','Schüler');
INSERT INTO users VALUES('8861323076','zi.benjiman@gmail.com','pbkdf2:sha256:1000000$hAqujFvGTvpBhdfP$07144e28e66ca4ead69f45f6e8d3ca1315ddad8cb285bd5081a8aec45e7a9fb1','Schüler');
INSERT INTO users VALUES('5965184874','resr','pbkdf2:sha256:1000000$5lQGWTZPjZ6iCNPm$6946e31903b79fa996f6a4cf02136c9a3bda19c97e18276222192a22f3e6209d','Schüler');
INSERT INTO users VALUES('4823751852','test@test.com','pbkdf2:sha256:1000000$N9ZxsTUFsnedG7gK$7b1bd077e73dab98d9e4c8ccfde63a27a90f6a451a845ffd082d6c6fe91ac0ca','Schüler');
INSERT INTO users VALUES('5525579881','plays517.11.23@gmail.com','pbkdf2:sha256:1000000$cbNoB4rjVWMaIBOz$86520fd6ab062c4e60c8503f61c4441afa0486da86afb19974c4079efaa2a783','Schüler');
INSERT INTO users VALUES('9135381588','ch.schueler@me.com','pbkdf2:sha256:1000000$veFWmVdFQ55TaNjV$382a744fcb1a03727c75540147fc366d1be1075a97ae992bde7b40a1da06776c','Schüler');
INSERT INTO users VALUES('7397131308','soha672236@gmail.com','pbkdf2:sha256:1000000$OCQimkj75GTiVC6o$7f95245b300df8cb093b6866fb49458f0e0aa2ed8b0251820837cb4fc7a24f29','Schüler');
INSERT INTO users VALUES('1330426390','telabuchweitz@gmail.com','pbkdf2:sha256:1000000$CfDtpGZ0M4slCtaY$8e8c43b5d13c2d7b81f3d37a50e4bbd674007d8950265a368ed4545d17094784','Schüler');
INSERT INTO users VALUES('1657082005','Hallo','pbkdf2:sha256:1000000$Vob3rj2rpOMbK0nc$bd7edc08a6c7182596af5338d96fa41de3067ad95dbf004ad9f74fe9fad63cac','Schüler');
INSERT INTO users VALUES('2126726409','raabe.katha@gmx.de','pbkdf2:sha256:1000000$niLu3uhEcmvpVJl0$ed78fb4d17229dcd48237f6c7af5a440f3718e023d7c6b8df292bdcdc646bcf0','Schüler');
INSERT INTO users VALUES('7371852878','tobiaswendler26@gmail.com','pbkdf2:sha256:1000000$56Zt3IaKFX4XdPno$fb8a0bb12e3dfc37f0d0d18094dba21de5fb2e9ca87f8caed380a081e434a41a','Schüler');
INSERT INTO users VALUES('0548063457','schroeder-mario@gmx.de','pbkdf2:sha256:1000000$AM1POH8NTSpH6Xni$999b88a40ea363e59e22aa36c31509b751dbd07ce818d6a328838407a2847d30','Schüler');
CREATE TABLE faecher (
	id INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	user_id VARCHAR(10) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO faecher VALUES(3,'test','949392911');
INSERT INTO faecher VALUES(4,'test','949392911');
INSERT INTO faecher VALUES(5,'test','949392911');
INSERT INTO faecher VALUES(8,'leck eier','9577629403');
INSERT INTO faecher VALUES(9,'Deutsch','1759660131');
INSERT INTO faecher VALUES(10,'Geschichte','2958333396');
INSERT INTO faecher VALUES(11,'Erdkunde','2958333396');
INSERT INTO faecher VALUES(14,'Latein','2958333396');
INSERT INTO faecher VALUES(15,'Latein','0550657942');
INSERT INTO faecher VALUES(16,'Deutsch','2958333396');
INSERT INTO faecher VALUES(17,'Kunst','2958333396');
INSERT INTO faecher VALUES(18,'Mathe','2958333396');
INSERT INTO faecher VALUES(19,'Mathe','4040214508');
INSERT INTO faecher VALUES(20,'Bio','2958333396');
INSERT INTO faecher VALUES(21,'Englisch','0550657942');
INSERT INTO faecher VALUES(22,'Zeugnis','2958333396');
INSERT INTO faecher VALUES(23,'Biologie','3548467220');
INSERT INTO faecher VALUES(25,'test','4823751852');
INSERT INTO faecher VALUES(28,'Deutsch','3548467220');
INSERT INTO faecher VALUES(29,'Kunst','3548467220');
INSERT INTO faecher VALUES(30,'Mathe','3548467220');
INSERT INTO faecher VALUES(31,'Erdkunde','3548467220');
INSERT INTO faecher VALUES(32,'Englisch','3548467220');
CREATE TABLE hausaufgaben (
	id INTEGER NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	description TEXT, 
	deadline DATETIME NOT NULL, 
	status VARCHAR(50), 
	fach_id INTEGER NOT NULL, 
	user_id VARCHAR(10) NOT NULL, comment TEXT DEFAULT '', 
	PRIMARY KEY (id), 
	FOREIGN KEY(fach_id) REFERENCES faecher (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO hausaufgaben VALUES(1,'test','asdasdasf','2025-02-20 00:00:00.000000','abgegeben',3,'949392911','');
INSERT INTO hausaufgaben VALUES(6,'leck eier','lelek eier','2025-02-11 00:00:00.000000','erledigt',8,'9577629403','');
INSERT INTO hausaufgaben VALUES(7,'Deutsch','Seite 11 Aufgabe 1-3','2025-02-03 00:00:00.000000','erledigt',9,'1759660131','');
INSERT INTO hausaufgaben VALUES(8,'Geschichte','Siehe Chat','2025-02-11 00:00:00.000000','abgegeben',10,'2958333396','');
INSERT INTO hausaufgaben VALUES(11,'Deutsch','Hü über die Blätter Konjungtionen (3 Blätter)','2025-02-12 00:00:00.000000','abgegeben',16,'2958333396','');
INSERT INTO hausaufgaben VALUES(12,'Latein','Selbsttest Lektion 7','2025-02-10 00:00:00.000000','erledigt',14,'2958333396','');
INSERT INTO hausaufgaben VALUES(15,'Kunst','Draht usw. Scheiße mitbringen','2025-02-21 00:00:00.000000','offen',17,'2958333396','');
INSERT INTO hausaufgaben VALUES(16,'Mathe','Ah s. 36','2025-02-11 00:00:00.000000','abgegeben',18,'2958333396','');
INSERT INTO hausaufgaben VALUES(17,'Bio','10 Stunden Test Herz etc.','2025-03-17 00:00:00.000000','offen',20,'2958333396','');
INSERT INTO hausaufgaben VALUES(18,'Englisch','WB, p. 37, ex. 7','2025-02-14 00:00:00.000000','offen',21,'0550657942','');
INSERT INTO hausaufgaben VALUES(19,'Englisch','Box Seite 54','2025-02-14 00:00:00.000000','offen',21,'0550657942','');
INSERT INTO hausaufgaben VALUES(20,'Geschichte','S.138','2025-02-18 00:00:00.000000','erledigt',10,'2958333396','-');
INSERT INTO hausaufgaben VALUES(21,'Mathe','S137 nr 3 eine aufgabe und ah s 38','2025-02-18 00:00:00.000000','offen',18,'2958333396','');
CREATE TABLE noten (
	id INTEGER NOT NULL, 
	note VARCHAR(10) NOT NULL, 
	art VARCHAR(50), 
	fach_id INTEGER NOT NULL, 
	user_id VARCHAR(10) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(fach_id) REFERENCES faecher (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO noten VALUES(1,'1+','Klassenarbeit',3,'949392911');
INSERT INTO noten VALUES(2,'1+','Klassenarbeit',8,'9577629403');
INSERT INTO noten VALUES(3,'2+','HÜ',11,'2958333396');
INSERT INTO noten VALUES(6,'4+','HÜ',19,'4040214508');
INSERT INTO noten VALUES(7,'4+','HÜ',19,'4040214508');
INSERT INTO noten VALUES(11,'1+','Plakat',25,'4823751852');
CREATE TABLE groups (
	id INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	user_id VARCHAR(10) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO groups VALUES(1,'TEST','949392911');
INSERT INTO groups VALUES(2,'test','2958333396');
INSERT INTO groups VALUES(3,'English','2218065927');
INSERT INTO groups VALUES(4,'Englisch Vokabeln','1759660131');
INSERT INTO groups VALUES(5,'Latein','3344497965');
INSERT INTO groups VALUES(6,'Latein','4317427014');
INSERT INTO groups VALUES(7,'Franz','3548467220');
INSERT INTO groups VALUES(8,'Franz2','3548467220');
INSERT INTO groups VALUES(9,'Latein','0548063457');
CREATE TABLE cards (
	id INTEGER NOT NULL, 
	front TEXT NOT NULL, 
	back TEXT NOT NULL, 
	group_id INTEGER NOT NULL, 
	user_id VARCHAR(10) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(group_id) REFERENCES groups (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO cards VALUES(1,'RTEST','asd',1,'949392911');
INSERT INTO cards VALUES(2,'asdadf','asdasfasdf',1,'949392911');
INSERT INTO cards VALUES(3,'ts','asd',2,'2958333396');
INSERT INTO cards VALUES(5,'Tree','Baum',3,'2218065927');
INSERT INTO cards VALUES(6,'Music','Musik',3,'2218065927');
INSERT INTO cards VALUES(7,'Schwester','Sister',4,'1759660131');
INSERT INTO cards VALUES(8,'Bruder','Brother',4,'1759660131');
INSERT INTO cards VALUES(10,'etsdasd','afsasd',2,'2958333396');
INSERT INTO cards VALUES(11,'Hello','Hallo',7,'3548467220');
INSERT INTO cards VALUES(12,'Cava?','Wie geht es dir?',7,'3548467220');
INSERT INTO cards VALUES(13,'ich','me',2,'2958333396');
INSERT INTO cards VALUES(14,'nein','no',2,'2958333396');
INSERT INTO cards VALUES(15,'qwsa','sadS',2,'2958333396');
INSERT INTO cards VALUES(16,'as','SDasA',2,'2958333396');
CREATE TABLE stundenplan (
	id INTEGER NOT NULL, 
	user_id VARCHAR(10) NOT NULL, 
	tag VARCHAR(20) NOT NULL, 
	stunde INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT _user_tag_stunde_uc UNIQUE (user_id, tag, stunde), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO stundenplan VALUES(1,'949392911','Montag',1,'sdffsdf');
INSERT INTO stundenplan VALUES(2,'2958333396','Dienstag',1,'Geschichte');
INSERT INTO stundenplan VALUES(3,'2958333396','Dienstag',2,'Geschichte');
INSERT INTO stundenplan VALUES(4,'2958333396','Dienstag',3,'Mathematik');
INSERT INTO stundenplan VALUES(5,'2958333396','Dienstag',4,'Mathematik');
INSERT INTO stundenplan VALUES(6,'2958333396','Dienstag',5,'Sport');
INSERT INTO stundenplan VALUES(7,'2958333396','Dienstag',6,'Sport');
INSERT INTO stundenplan VALUES(8,'2958333396','Mittwoch',1,'Deutsch');
INSERT INTO stundenplan VALUES(9,'2958333396','Mittwoch',2,'Deutsch');
INSERT INTO stundenplan VALUES(10,'2958333396','Mittwoch',3,'VRF');
INSERT INTO stundenplan VALUES(11,'2958333396','Mittwoch',4,'Sport');
INSERT INTO stundenplan VALUES(12,'2958333396','Mittwoch',5,'Musik');
INSERT INTO stundenplan VALUES(13,'2958333396','Mittwoch',6,'Musik');
INSERT INTO stundenplan VALUES(14,'2958333396','Donnerstag',1,'Erdkunde');
INSERT INTO stundenplan VALUES(15,'2958333396','Donnerstag',2,'Reli');
INSERT INTO stundenplan VALUES(16,'2958333396','Donnerstag',3,'Latein');
INSERT INTO stundenplan VALUES(17,'2958333396','Donnerstag',4,'Latein');
INSERT INTO stundenplan VALUES(18,'2958333396','Donnerstag',5,'Deutsch');
INSERT INTO stundenplan VALUES(19,'2958333396','Donnerstag',6,'Deutsch');
INSERT INTO stundenplan VALUES(20,'2958333396','Montag',1,'Biologie');
INSERT INTO stundenplan VALUES(21,'2958333396','Montag',2,'Biologie');
INSERT INTO stundenplan VALUES(22,'2958333396','Montag',3,'Englisch');
INSERT INTO stundenplan VALUES(23,'2958333396','Montag',4,'Englisch');
INSERT INTO stundenplan VALUES(24,'2958333396','Montag',5,'Latein');
INSERT INTO stundenplan VALUES(25,'2958333396','Montag',6,'Latein');
INSERT INTO stundenplan VALUES(26,'2958333396','Freitag',1,'Kunst');
INSERT INTO stundenplan VALUES(27,'0550657942','Montag',2,'Biologie');
INSERT INTO stundenplan VALUES(28,'2958333396','Freitag',2,'Kunst');
INSERT INTO stundenplan VALUES(29,'0550657942','Montag',1,'Biologie');
INSERT INTO stundenplan VALUES(30,'2958333396','Freitag',3,'Englisch');
INSERT INTO stundenplan VALUES(31,'2958333396','Freitag',4,'Erdkunde');
INSERT INTO stundenplan VALUES(32,'0550657942','Montag',3,'Englisch');
INSERT INTO stundenplan VALUES(33,'2958333396','Freitag',5,'Mathematik');
INSERT INTO stundenplan VALUES(34,'2958333396','Freitag',6,'Mathematik');
INSERT INTO stundenplan VALUES(35,'0550657942','Montag',4,'Englisch');
INSERT INTO stundenplan VALUES(36,'0550657942','Montag',5,'Latein');
INSERT INTO stundenplan VALUES(37,'0550657942','Montag',6,'Latein');
INSERT INTO stundenplan VALUES(38,'0550657942','Dienstag',1,'Geschichte');
INSERT INTO stundenplan VALUES(39,'0550657942','Dienstag',2,'Geschichte');
INSERT INTO stundenplan VALUES(40,'0550657942','Dienstag',3,'Mathematik');
INSERT INTO stundenplan VALUES(41,'0550657942','Dienstag',4,'Mathematik');
INSERT INTO stundenplan VALUES(42,'0550657942','Dienstag',5,'Sport');
INSERT INTO stundenplan VALUES(43,'0550657942','Dienstag',6,'Sport');
INSERT INTO stundenplan VALUES(44,'0550657942','Mittwoch',1,'Deutsch');
INSERT INTO stundenplan VALUES(45,'0550657942','Mittwoch',2,'Deutsch');
INSERT INTO stundenplan VALUES(46,'0550657942','Mittwoch',3,'VRF');
INSERT INTO stundenplan VALUES(47,'0550657942','Mittwoch',4,'Sport');
INSERT INTO stundenplan VALUES(48,'0550657942','Mittwoch',5,'Musik');
INSERT INTO stundenplan VALUES(49,'0550657942','Mittwoch',6,'Musik');
INSERT INTO stundenplan VALUES(50,'0550657942','Donnerstag',1,'Erdkunde');
INSERT INTO stundenplan VALUES(51,'0550657942','Donnerstag',2,'Reli');
INSERT INTO stundenplan VALUES(52,'0550657942','Donnerstag',3,'Latein');
INSERT INTO stundenplan VALUES(53,'0550657942','Donnerstag',4,'Latein');
INSERT INTO stundenplan VALUES(54,'0550657942','Donnerstag',5,'Deutsch');
INSERT INTO stundenplan VALUES(55,'0550657942','Donnerstag',6,'Deutsch');
INSERT INTO stundenplan VALUES(56,'0550657942','Freitag',1,'Kunst');
INSERT INTO stundenplan VALUES(57,'0550657942','Freitag',2,'Kunst');
INSERT INTO stundenplan VALUES(58,'0550657942','Freitag',3,'Erdkunde');
INSERT INTO stundenplan VALUES(59,'0550657942','Freitag',4,'Englisch');
INSERT INTO stundenplan VALUES(60,'0550657942','Freitag',5,'Mathe');
INSERT INTO stundenplan VALUES(61,'0550657942','Freitag',6,'Mathe');
INSERT INTO stundenplan VALUES(62,'3548467220','Montag',1,'Mathe');
INSERT INTO stundenplan VALUES(63,'3548467220','Montag',2,'Mathe');
INSERT INTO stundenplan VALUES(64,'3548467220','Montag',3,'Deutsch');
INSERT INTO stundenplan VALUES(65,'3548467220','Montag',4,'Deutsch');
INSERT INTO stundenplan VALUES(66,'3548467220','Montag',5,'Französisch');
INSERT INTO stundenplan VALUES(67,'3548467220','Montag',6,'Französisch');
INSERT INTO stundenplan VALUES(68,'3548467220','Dienstag',1,'Englisch');
INSERT INTO stundenplan VALUES(69,'3548467220','Dienstag',2,'Englisch');
INSERT INTO stundenplan VALUES(70,'3548467220','Dienstag',3,'Kunst');
INSERT INTO stundenplan VALUES(71,'3548467220','Dienstag',4,'Kunst');
INSERT INTO stundenplan VALUES(72,'3548467220','Dienstag',5,'Erdkunde');
INSERT INTO stundenplan VALUES(73,'3548467220','Dienstag',6,'Erdkunde');
INSERT INTO stundenplan VALUES(74,'3548467220','Mittwoch',1,'Erdkunde');
INSERT INTO stundenplan VALUES(75,'3548467220','Mittwoch',2,'Mathe');
INSERT INTO stundenplan VALUES(76,'3548467220','Mittwoch',3,'Französisch');
INSERT INTO stundenplan VALUES(77,'3548467220','Mittwoch',4,'Französisch');
INSERT INTO stundenplan VALUES(78,'3548467220','Mittwoch',5,'Deutsch');
INSERT INTO stundenplan VALUES(79,'3548467220','Mittwoch',6,'Deutsch');
INSERT INTO stundenplan VALUES(80,'3548467220','Donnerstag',1,'Mathe');
INSERT INTO stundenplan VALUES(81,'3548467220','Donnerstag',2,'Sport');
INSERT INTO stundenplan VALUES(82,'3548467220','Donnerstag',3,'Englisch');
INSERT INTO stundenplan VALUES(83,'3548467220','Donnerstag',4,'Englisch');
INSERT INTO stundenplan VALUES(84,'3548467220','Donnerstag',5,'Biologie');
INSERT INTO stundenplan VALUES(85,'3548467220','Donnerstag',6,'Biologie');
INSERT INTO stundenplan VALUES(86,'3548467220','Freitag',1,'Sport');
INSERT INTO stundenplan VALUES(87,'3548467220','Freitag',2,'Sport');
INSERT INTO stundenplan VALUES(88,'3548467220','Freitag',3,'Religion');
INSERT INTO stundenplan VALUES(89,'3548467220','Freitag',4,'VRF');
INSERT INTO stundenplan VALUES(90,'3548467220','Freitag',5,'Musik');
INSERT INTO stundenplan VALUES(91,'3548467220','Freitag',6,'Musik');
INSERT INTO stundenplan VALUES(92,'5525579881','Montag',1,'Englisch');
INSERT INTO stundenplan VALUES(93,'5525579881','Montag',2,'Englisch');
INSERT INTO stundenplan VALUES(94,'5525579881','Montag',3,'Projekt');
INSERT INTO stundenplan VALUES(95,'5525579881','Montag',4,'Deutsch');
INSERT INTO stundenplan VALUES(96,'5525579881','Montag',5,'WPF Sport');
INSERT INTO stundenplan VALUES(97,'5525579881','Montag',6,'WPF Sport');
INSERT INTO stundenplan VALUES(98,'5965184874','Montag',1,'Hallo');
CREATE TABLE stundenplan_config (
	id INTEGER NOT NULL, 
	user_id VARCHAR(10) NOT NULL, 
	stundenanzahl INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO stundenplan_config VALUES(1,'949392911',6);
INSERT INTO stundenplan_config VALUES(2,'2958333396',6);
INSERT INTO stundenplan_config VALUES(3,'9577629403',100000);
INSERT INTO stundenplan_config VALUES(4,'0550657942',6);
CREATE TABLE klassen (
	id INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	teacher_id VARCHAR(10) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(teacher_id) REFERENCES users (id)
);
INSERT INTO klassen VALUES(1,'7c','2958333396');
CREATE TABLE klasse_students (
	klasse_id INTEGER NOT NULL, 
	student_id VARCHAR(10) NOT NULL, 
	PRIMARY KEY (klasse_id, student_id), 
	FOREIGN KEY(klasse_id) REFERENCES klassen (id), 
	FOREIGN KEY(student_id) REFERENCES users (id)
);
INSERT INTO klasse_students VALUES(1,'3548467220');
COMMIT;
