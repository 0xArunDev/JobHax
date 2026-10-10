CREATE TABLE `saved_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicant_id` int NOT NULL,
	`job_id` int NOT NULL,
	`saved_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `saved_jobs_applicant_id_job_id_unique` UNIQUE(`applicant_id`,`job_id`),
	CONSTRAINT `saved_jobs_applicant_id_users_id_fk` FOREIGN KEY (`applicant_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `saved_jobs_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action
);

CREATE INDEX `saved_jobs_applicant_id_idx` ON `saved_jobs` (`applicant_id`);
CREATE INDEX `saved_jobs_job_id_idx` ON `saved_jobs` (`job_id`);
