import {parse} from './budgetbytes';

const SOURCE = 'https://www.budgetbytes.com/2016/02/pork-gyoza/',
    RATING = 8.2,
    NOTES = 'test';

const main = async () => {
    const result = await parse(SOURCE, NOTES, RATING);

    console.log(JSON.stringify(result, null, 2));
};

main();