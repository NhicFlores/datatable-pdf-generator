ALTER TABLE "dev-reports"."users" ALTER COLUMN "role" SET DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE "dev-reports"."users" ALTER COLUMN "branch" SET DEFAULT 'MANHATTAN';--> statement-breakpoint
ALTER TABLE "dev-reports"."drivers" ADD COLUMN "last_four" varchar(4);--> statement-breakpoint
ALTER TABLE "dev-reports"."drivers" ADD COLUMN "alias" varchar(255);