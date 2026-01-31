
ALTER TABLE "mentorados" ALTER COLUMN "turma" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "playbook_modules" ALTER COLUMN "turma" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ranking_mensal" ALTER COLUMN "turma" SET DATA TYPE text;--> statement-breakpoint
UPDATE "mentorados" SET "turma" = 'neon' WHERE "turma" IN ('neon_estrutura', 'neon_escala');--> statement-breakpoint
UPDATE "ranking_mensal" SET "turma" = 'neon' WHERE "turma" IN ('neon_estrutura', 'neon_escala');--> statement-breakpoint
UPDATE "playbook_modules" SET "turma" = 'neon' WHERE "turma" IN ('neon_estrutura', 'neon_escala');--> statement-breakpoint
DROP TYPE "public"."turma";--> statement-breakpoint
CREATE TYPE "public"."turma" AS ENUM('neon');--> statement-breakpoint
ALTER TABLE "mentorados" ALTER COLUMN "turma" SET DATA TYPE "public"."turma" USING "turma"::"public"."turma";--> statement-breakpoint
ALTER TABLE "playbook_modules" ALTER COLUMN "turma" SET DATA TYPE "public"."turma" USING "turma"::"public"."turma";--> statement-breakpoint
ALTER TABLE "ranking_mensal" ALTER COLUMN "turma" SET DATA TYPE "public"."turma" USING "turma"::"public"."turma";--> statement-breakpoint