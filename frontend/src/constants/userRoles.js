import { useMemo } from 'react';
import { useAdditionalData } from '../context/AdditionalDataContext';

// Role ids that should NOT appear as Users sidebar sub-items / slug routes.
// 1 = Super Admin, 7 = Patient.
const EXCLUDED_ROLE_IDS = [1];

/**
 * Returns the list of user roles (from additionalData) shaped for the
 * Users sidebar submenu and the per-slug user routes.
 * Each entry: { slug, roleId, title }.
 */
export const useUserRoleSlugs = () => {
  const { additionalData } = useAdditionalData();

  return useMemo(() => {
    const roles = additionalData?.roles || [];
    return roles
      .filter((r) => r?.slug && !EXCLUDED_ROLE_IDS.includes(Number(r.id)))
      .map((r) => ({
        slug: r.slug,
        roleId: Number(r.id),
        title: r.name + 's',
      }));
  }, [additionalData]);
};
