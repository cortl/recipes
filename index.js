import fs from 'fs';

import {getParserForSite, reportMissingParsers} from './src/parsers';
import {getSpreadsheet} from './src/spreadsheet';
import {mapDataToRecipeType, mapWithLog} from './src/mapper';
import {byRecipeHasRating, byRecipeHasURL, byRecipeShouldBeSkipped} from './src/filters';
import {updateMarkdown} from './src/table-of-contents';
import {getExistingRecipe} from './src/files';

const downloadRecipe = async ({url, notes, rating}) => {
    const parser = getParserForSite(url)

    try {
        const recipe = await parser(url, notes, rating);
        const location = `recipes/${recipe.slug}.json`
        const existingRecipe = getExistingRecipe(url);

        if (existingRecipe) {
            console.log(`Old recipe exists under ${existingRecipe}`);

            const oldRecipe = JSON.parse(fs.readFileSync(location));
            const recipeToWrite = {
                ...oldRecipe,
                rating,
                notes: [notes]
            };

            fs.writeFileSync(location, JSON.stringify(recipeToWrite, null, 2));

            return recipeToWrite;
        }

        console.log(`recipe cached: ${location}`);
        fs.writeFileSync(location, JSON.stringify(recipe, null, 2));

        return recipe;

    } catch (error) {
        console.error(`Error: ${error.message}${error.stack ? ` ${error.stack}` : ''}`);
    };
}

const createRecipesFromSheet = async (data) => {
    const recipesToDownload = data
        .map(mapDataToRecipeType)
        .filter(byRecipeHasRating)
        .filter(byRecipeHasURL)
        .filter(byRecipeShouldBeSkipped)
        .map(mapWithLog(({title}) => `Found ${title} in spreadsheet`));

    const recipes = await Promise.all(recipesToDownload.map(downloadRecipe));

    return recipes.filter(Boolean);
}

const main = async () => {
    try {
        const data = await getSpreadsheet();
        const recipes = await createRecipesFromSheet(data);

        updateMarkdown(recipes);

        reportMissingParsers();
    } catch (error) {
        console.error(error);
    }
}

main();