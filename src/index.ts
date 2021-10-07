import { SosApi } from 'cobalt-int-sdk';
import dotenv from 'dotenv';
import csvtojson from 'csvtojson';
import * as json2csv from 'json2csv';
import * as fs from 'fs';
import { IBusiness } from 'cobalt-int-common';

dotenv.config();

(async () => {
    const businesses = await csvtojson().fromFile('pizza businesses.csv');

    console.log('businesses length', businesses.length);

    const fullBusinesses: any[] = [];
    const sosApi = new SosApi(process.env.cobaltIntApiKey);

    for (let i = 0; i < businesses.length; i++) {
        const business = businesses[i];
        let fullBusinessResponse: IBusiness[];

        try {
            fullBusinessResponse = await sosApi.getBusinessDetailsBySosId(business['Entity ID'], 'va');
        }
        catch (e) {
            console.log('Some error happened while getting business data', e);
            continue;
        }
        const fullBusiness = fullBusinessResponse[0];

        console.log('Full business', fullBusiness, 'originalBusinessId', business['Entity ID']);

        if (fullBusiness.email && fullBusiness.email !== 'N/A') {
            fullBusinesses.push(fullBusiness)
        }
    }

    console.log('total full businesses found', fullBusinesses.length);

    const csv = json2csv.parse(fullBusinesses);

    fs.writeFileSync('Full pizza businesses found.csv', csv);
})();