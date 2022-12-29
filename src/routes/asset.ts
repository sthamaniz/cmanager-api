import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as fs from 'fs';

import { authorize } from '../service/auth';

import env from '../env';

const router = Router();

router.post('/', authorize, (req: Request, res: Response) => {
  try {
    const { group } = req.body;
    const { file } = req.files;

    const folderPath = `${env.uploadDir}/${env.appEnv}/${group}`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    let imagePath: any;
    if (Array.isArray(file)) {
      imagePath = [];

      file.forEach((f) => {
        const fileName = f.name.split(' ').join('_');
        const filePath = `${folderPath}/${fileName}`;

        f.mv(filePath, (error: any) => {
          if (error) {
            console.log({ error });
            throw new Error('something went wrong');
          }
        });

        imagePath.push(`${group}/${fileName}`);
      });
    } else {
      const fileName = file.name.split(' ').join('_');
      const filePath = `${folderPath}/${fileName}`;

      file.mv(filePath, (error: any) => {
        if (error) {
          console.log({ error });
          throw new Error('something went wrong');
        }
      });

      imagePath = `${group}/${fileName}`;
    }

    res.json({ sccess: true, data: imagePath });
  } catch (error) {
    console.log({ error });
    throw error;
  }
});

//serving static files from upload dir for all routes after /assets/
router.use('/', express.static(`${env.uploadDir}/${env.appEnv}`));

export default router;
