import 'dotenv/config';
import prisma from '../src/config/database';
import { PlacementOfficerService } from '../src/modules/placement-officer/placement-officer.service';

async function main() {
  const apps = await PlacementOfficerService.getApplications();
  console.log('Total Applications found:', apps.length);
  apps.forEach((app) => {
    console.log(`- ID: ${app.id}, Student: ${app.student?.user?.name}, Job: ${app.job?.title}, Status: ${app.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
