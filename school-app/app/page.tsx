import React from 'react';
import { dbAdapter } from '@/lib/db-adapter';
import HomePageView from '@/components/public/HomePageView';

export const revalidate = 0; // Fresh dynamic content

export default async function HomePage() {
  const [
    schoolInfo,
    principal,
    upcomingActivities,
    completedActivities,
    facilities,
    teachers,
    staff,
    announcements,
    gallery,
  ] = await Promise.all([
    dbAdapter.getSchoolInfo(),
    dbAdapter.getPrincipal(),
    dbAdapter.getActivities({ status: 'upcoming', publishedOnly: true }),
    dbAdapter.getActivities({ status: 'completed', publishedOnly: true }),
    dbAdapter.getFacilities(true),
    dbAdapter.getTeachers(true),
    dbAdapter.getStaff(true),
    dbAdapter.getAnnouncements(true),
    dbAdapter.getGallery(),
  ]);

  return (
    <HomePageView
      initialData={{
        schoolInfo,
        principal,
        upcomingActivities,
        completedActivities,
        facilities,
        teachers,
        staff,
        announcements,
        gallery,
      }}
    />
  );
}
