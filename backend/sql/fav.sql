CREATE TABLE IF NOT EXISTS `favorites` (
	`id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `book_id` VARCHAR(8) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_favorites_user`
		FOREIGN KEY (`user_id`)
        REFERENCES user (`id`)
        ON UPDATE RESTRICT
        ON DELETE CASCADE,
	CONSTRAINT `fk_favorites_book2018`
		FOREIGN KEY (`book_id`)
        REFERENCES book2018 (`book_id`)
        ON UPDATE RESTRICT
        ON DELETE CASCADE
);