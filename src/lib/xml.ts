import { parseStringPromise } from 'xml2js';


export async function parseAndaXml(xml: string) {
    const json = await parseStringPromise(xml, { explicitArray: false });
    return json; 
}