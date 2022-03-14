import * as express from 'express';

import { pgPool } from '../pool';

const router = express.Router();

router.get('/metadata-graph/:iri', async (req, res) => {
  const { iri } = req.params;
  const iri_re = new RegExp('regen:.+.rdf');
  let client;
  try {
    if (!iri_re.test(iri)) {
      res
        .status(400)
        .send('Invalid IRI, it must be of the form regen:<iri-hash>.rdf');
    } else {
      client = await pgPool.connect();
      try {
        const { rows } = await client.query(
          'select metadata from metadata_graph where iri=$1',
          [iri],
        );
        if (!rows.length) {
          res.status(404).send(`metadata_graph with the iri ${iri} not found`);
        } else {
          res.json(rows[0]);
        }
      } catch (err) {
        console.error(err);
        res.status(400).send(err);
      }
    }
  } catch (err) {
    console.error('Error acquiring postgres client', err);
    res.sendStatus(500);
  } finally {
    if (client) {
      client.release();
    }
  }
});

export default router;
