CREATE TABLE IF NOT EXISTS user (
	`id` INT NOT NULL AUTO_INCREMENT,
	user_id varchar(64) not null,
	password varchar(64) not null,
	email varchar(64) not null,
	primary key(`id`),
    index `user_pw` (user_id, password asc)
);

insert into user(user_id, password, email) values
	('fred', sha1('fred'), 'fred@bedrock.com'),
	('wilma', sha1('wilma'), 'wilma@bedrock.com'),
	('barney', sha1('barney'), 'barney@bedrock.com'),
	('betty', sha1('betty'), 'betty@bedrock.com');