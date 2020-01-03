const budgetbytes = require('./seriouseats');

const main = async () => {
    const rating = 8.2, notes = 'test';
    const source = 'https://www.seriouseats.com/recipes/2016/10/pressure-cooker-beef-stew-recipe.html';

    const result = await budgetbytes.parse(source, notes, rating);
    console.log(JSON.stringify(result, null, 2));
};

main();