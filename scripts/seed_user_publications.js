require('dotenv').config();
const prisma = require('../src/config/db');
const cache = require('../src/utils/cache');

async function seedPublications() {
  console.log('Inserting 3 publications requested by user...');

  const pubs = [
    {
      title: "Muhammad Haerul's on Medium",
      publisher: "Medium",
      date: "Aug 12, 2025",
      link: "https://medium.com/@muhammadhaerul.25",
      description: "Technical articles, guides, and engineering deep-dives covering Artificial Intelligence, Computer Vision, Full-Stack System Architecture, and applied machine learning by Muhammad Haerul.",
      accent_color: "var(--black)",
      sort_order: 1
    },
    {
      title: "Galaxy Object Detection",
      publisher: "Python Package Index (PyPI)",
      date: "Jun 2, 2025",
      link: "https://pypi.org/project/galaxy-object-detection-core/",
      description: "Galaxy Object Detection Core is a modular, production-ready object detection library built on YOLO and YOLOWorld architectures. Designed for real-time performance and high-precision detection, the package supports 20+ industry categories including safety gear, documents, vehicles, road damage, KTP, and minerals. The library provides simple APIs for detection and segmentation, is fully optimized for Indonesian datasets, and offers pretrained YOLO models for rapid deployment across industries such as transportation, construction, FMCG, and natural resources.",
      accent_color: "var(--blue)",
      sort_order: 2
    },
    {
      title: "Development and Comparison of PPE Detection Models in Industrial Workers Based on Computer Vision",
      publisher: "Hasanuddin University",
      date: "Apr 24, 2025",
      link: "https://repository.unhas.ac.id/id/eprint/44411/",
      description: "Undergraduate scientific research and university repository publication analyzing, developing, and benchmarking computer vision models for Personal Protective Equipment (PPE) compliance detection in industrial environments.",
      accent_color: "var(--yellow)",
      sort_order: 3
    }
  ];

  for (const pub of pubs) {
    const existing = await prisma.publication.findFirst({
      where: { title: pub.title }
    });

    if (existing) {
      const updated = await prisma.publication.update({
        where: { id: existing.id },
        data: pub
      });
      console.log('Updated publication:', updated.title);
    } else {
      const created = await prisma.publication.create({
        data: pub
      });
      console.log('Created publication:', created.title);
    }
  }

  cache.del('publications:all');
  cache.del('portfolio:bootstrap');
  console.log('Cache cleared successfully.');
  process.exit(0);
}

seedPublications().catch(err => {
  console.error('Error seeding publications:', err);
  process.exit(1);
});
