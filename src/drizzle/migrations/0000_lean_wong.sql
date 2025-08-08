CREATE SCHEMA IF NOT EXISTS "dev-reports";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev-reports"."drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"branch" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev-reports"."fuel_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" varchar(100) NOT NULL,
	"driver_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"invoice_number" varchar(255) NOT NULL,
	"gallons" numeric(8, 3) NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"seller_state" varchar(100) NOT NULL,
	"seller_name" varchar(255) NOT NULL,
	"odometer" integer NOT NULL,
	"receipt" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev-reports"."transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_reference" varchar(255) NOT NULL,
	"cardholder_name" varchar(255) NOT NULL,
	"last_four_digits" varchar(4) NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"posting_date" timestamp NOT NULL,
	"billing_amount" numeric(10, 2) NOT NULL,
	"line_amount" numeric(10, 2) NOT NULL,
	"line_number" integer NOT NULL,
	"gl_code" varchar(50) NOT NULL,
	"gl_code_description" text,
	"reason_for_expense" text,
	"receipt_image_name" varchar(500),
	"receipt_image_reference_id" varchar(255),
	"supplier_name" varchar(255),
	"supplier_city" varchar(100),
	"supplier_state" varchar(100),
	"workflow_status" varchar(100),
	"merchant_category_code" varchar(10),
	"odometer_reading" integer,
	"fuel_quantity" numeric(8, 3),
	"fuel_type" varchar(50),
	"fuel_unit_cost" numeric(8, 4),
	"fuel_unit_of_measure" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_transaction_reference_unique" UNIQUE("transaction_reference")
);
--> statement-breakpoint
ALTER TABLE "dev-reports"."fuel_transactions" ADD CONSTRAINT "fuel_transactions_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "dev-reports"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drivers_name_idx" ON "dev-reports"."drivers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "drivers_branch_idx" ON "dev-reports"."drivers" USING btree ("branch");--> statement-breakpoint
CREATE INDEX "drivers_name_branch_idx" ON "dev-reports"."drivers" USING btree ("name","branch");--> statement-breakpoint
CREATE INDEX "fuel_transactions_vehicle_id_idx" ON "dev-reports"."fuel_transactions" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "fuel_transactions_driver_id_idx" ON "dev-reports"."fuel_transactions" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "fuel_transactions_date_idx" ON "dev-reports"."fuel_transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "fuel_transactions_seller_state_idx" ON "dev-reports"."fuel_transactions" USING btree ("seller_state");--> statement-breakpoint
CREATE INDEX "fuel_transactions_vehicle_driver_idx" ON "dev-reports"."fuel_transactions" USING btree ("vehicle_id","driver_id");--> statement-breakpoint
CREATE INDEX "transactions_cardholder_name_idx" ON "dev-reports"."transactions" USING btree ("cardholder_name");--> statement-breakpoint
CREATE INDEX "transactions_transaction_date_idx" ON "dev-reports"."transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "transactions_gl_code_idx" ON "dev-reports"."transactions" USING btree ("gl_code");--> statement-breakpoint
CREATE INDEX "transactions_supplier_state_idx" ON "dev-reports"."transactions" USING btree ("supplier_state");--> statement-breakpoint
CREATE INDEX "transactions_workflow_status_idx" ON "dev-reports"."transactions" USING btree ("workflow_status");