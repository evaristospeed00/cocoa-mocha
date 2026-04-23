import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";
import {
  createUserAccountWorkflow,
} from "@medusajs/medusa/core-flows";

type UserRecord = {
  id: string;
  email?: string | null;
};

type AuthIdentityRecord = {
  id: string;
  app_metadata?: Record<string, unknown> | null;
};

const EMAILPASS_PROVIDER = "emailpass";

export default async function ensureAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const authModuleService = container.resolve(Modules.AUTH) as any;

  const adminEmail = process.env.MEDUSA_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    logger.info(
      "MEDUSA_ADMIN_EMAIL or MEDUSA_ADMIN_PASSWORD is missing. Admin sync skipped."
    );
    return;
  }

  const { data: users } = await query.graph({
    entity: "user",
    fields: ["id", "email"],
    filters: {
      email: adminEmail,
    },
  });

  let user = (users?.[0] as UserRecord | undefined) ?? null;

  let authIdentity: AuthIdentityRecord | null = null;

  try {
    authIdentity = (await authModuleService
      .getAuthIdentityProviderService(EMAILPASS_PROVIDER)
      .retrieve({
        entity_id: adminEmail,
      })) as AuthIdentityRecord;
  } catch (error) {
    if (!(error instanceof MedusaError) || error.type !== MedusaError.Types.NOT_FOUND) {
      throw error;
    }
  }

  if (!user) {
    if (!authIdentity) {
      const registration = await authModuleService.register(EMAILPASS_PROVIDER, {
        body: {
          email: adminEmail,
          password: adminPassword,
        },
      });

      if (!registration.success || !registration.authIdentity) {
        throw new Error(
          registration.error || `Failed to register auth identity for ${adminEmail}.`
        );
      }

      authIdentity = registration.authIdentity as AuthIdentityRecord;
    }

    const { result } = await createUserAccountWorkflow(container).run({
      input: {
        authIdentityId: authIdentity.id,
        userData: {
          email: adminEmail,
        },
      },
    });

    user = result as UserRecord;

    logger.info(`Created Medusa admin user ${adminEmail}.`);
  } else {
    logger.info(`Found existing Medusa admin user ${adminEmail}. Repairing credentials...`);

    if (!authIdentity) {
      const registration = await authModuleService.register(EMAILPASS_PROVIDER, {
        body: {
          email: adminEmail,
          password: adminPassword,
        },
      });

      if (!registration.success || !registration.authIdentity) {
        throw new Error(
          registration.error || `Failed to create auth identity for ${adminEmail}.`
        );
      }

      authIdentity = registration.authIdentity as AuthIdentityRecord;
    }
  }

  const passwordUpdate = await authModuleService.updateProvider(EMAILPASS_PROVIDER, {
    entity_id: adminEmail,
    password: adminPassword,
  });

  if (!passwordUpdate.success) {
    throw new Error(
      passwordUpdate.error || `Failed to update password for ${adminEmail}.`
    );
  }

  const currentMetadata = authIdentity?.app_metadata || {};

  await authModuleService.updateAuthIdentities({
    id: authIdentity!.id,
    app_metadata: {
      ...currentMetadata,
      user_id: user!.id,
    },
  });

  logger.info(`Ensured Medusa admin login for ${adminEmail}.`);
}
