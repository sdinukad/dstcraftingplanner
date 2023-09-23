let jsonData = {
    items: {}
};

document.addEventListener("DOMContentLoaded", function () {
    // Load existing JSON data
    fetch("db.json")
        .then((response) => response.json())
        .then((data) => {
            jsonData = data;
            // Populate the JSON textarea with data from db.json
            const jsonInput = document.getElementById("json-input");
            jsonInput.value = JSON.stringify(jsonData, null, 4);
            // Populate form with existing data (if any)
            //populateFormFromData();
            // Populate the crafting table with data.
            populateCraftingTable(jsonData.items);
        })
        .catch((error) => console.error("Error loading JSON data:", error));
});

// Rest of your code...

// Load existing JSON data
/*fetch("db.json")
    .then((response) => response.json())
    .then((data) => {
        jsonData = data;
        // Populate form with existing data (if any)
        populateFormFromData();
        // Populate the crafting table with data.
        populateCraftingTable(jsonData.items);
    })
    .catch((error) => console.error("Error loading JSON data:", error));
*/
document.getElementById("data-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const itemName = document.getElementById("item-name").value;
    const itemType = document.getElementById("item-type").value;
    const itemDescription = document.getElementById("description").value;

    if (!itemName || !itemType) {
        alert("Item name and type are required.");
        return;
    }

    const itemData = {
        type: itemType,
        description: itemDescription
    };

    if (itemType === "craftable") {
        const ingredients = [];
        const recipeItems = document.querySelectorAll(".ingredient-item");
        const recipeQuantities = document.querySelectorAll(".ingredient-quantity");

        recipeItems.forEach((item, index) => {
            const ingredientName = item.value;
            const ingredientQuantity = parseInt(recipeQuantities[index].value);

            if (ingredientName && !isNaN(ingredientQuantity) && ingredientQuantity > 0) {
                ingredients.push({ item: ingredientName, quantity: ingredientQuantity });
            }
        });

        if (ingredients.length > 0) {
            itemData.recipe = ingredients;
        }
    }

    jsonData.items[itemName] = itemData;

    // Update JSON data and reset form
    updateJsonData();
    document.getElementById("data-form").reset();
    document.getElementById("recipe-container").style.display = "none";
});

document.getElementById("item-type").addEventListener("change", function () {
    const recipeContainer = document.getElementById("recipe-container");
    if (this.value === "craftable") {
        recipeContainer.style.display = "block";
    } else {
        recipeContainer.style.display = "none";
    }
});

document.getElementById("add-ingredient-button").addEventListener("click", function () {
    const recipe = document.getElementById("recipe");
    const ingredientItem = document.createElement("input");
    ingredientItem.type = "text";
    ingredientItem.className = "ingredient-item";
    ingredientItem.placeholder = "Ingredient Name";

    const ingredientQuantity = document.createElement("input");
    ingredientQuantity.type = "number";
    ingredientQuantity.className = "ingredient-quantity";
    ingredientQuantity.placeholder = "Quantity";
    ingredientQuantity.min = 1;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
        recipe.removeChild(ingredientItem);
        recipe.removeChild(ingredientQuantity);
        recipe.removeChild(removeButton);
    });

    recipe.appendChild(ingredientItem);
    recipe.appendChild(ingredientQuantity);
    recipe.appendChild(removeButton);
});


document.getElementById("copy-button").addEventListener("click", function () {
    const jsonInput = document.getElementById("json-input");
    jsonInput.value = JSON.stringify(jsonData, null, 4);
    jsonInput.select();
    document.execCommand("copy");
    alert("JSON data copied to clipboard!");
});

// Add an event listener for the "Save Data" button
document.getElementById("save-button").addEventListener("click", function () {
    // Update JSON data with new items
    updateJsonData();
    
    // Convert the JSON data to a Blob
    const jsonDataStr = JSON.stringify(jsonData, null, 4);
    const blob = new Blob([jsonDataStr], { type: "application/json" });
  
    // Create a download link for the Blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "db.json";
    document.body.appendChild(a);
  
    // Trigger a click event on the download link to save the file
    a.click();
  
    // Revoke the Object URL to free up resources
    window.URL.revokeObjectURL(url);
  
    // Show an alert to indicate that the data has been saved
    alert("JSON file downloaded! Replace db.json with the new file.");
  });
  
function populateFormFromData() {
    for (const itemName in jsonData.items) {
        const itemData = jsonData.items[itemName];
        document.getElementById("item-name").value = itemName;
        document.getElementById("item-type").value = itemData.type;
        document.getElementById("description").value = itemData.description || '';

        if (itemData.type === "craftable" && itemData.recipe) {
            itemData.recipe.forEach((ingredient) => {
                const ingredientItem = document.createElement("input");
                ingredientItem.type = "text";
                ingredientItem.className = "ingredient-item";
                ingredientItem.value = ingredient.item;

                const ingredientQuantity = document.createElement("input");
                ingredientQuantity.type = "number";
                ingredientQuantity.className = "ingredient-quantity";
                ingredientQuantity.value = ingredient.quantity;
                ingredientQuantity.min = 1;

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.textContent = "Remove";
                removeButton.addEventListener("click", function () {
                    recipe.removeChild(ingredientItem);
                    recipe.removeChild(ingredientQuantity);
                    recipe.removeChild(removeButton);
                });

                const recipe = document.getElementById("recipe");
                recipe.appendChild(ingredientItem);
                recipe.appendChild(ingredientQuantity);
                recipe.appendChild(removeButton);
            });
        }
    }
}

function updateJsonData() {
    const jsonInput = document.getElementById("json-input");
    jsonInput.value = JSON.stringify(jsonData, null, 4);
}

function populateCraftingTable(items) {
    const table = document.getElementById("crafting-table");

    // Create table headers.
    const tableHeaders = ["Item", "Type", "Description", "Recipe", "Requirements", "Quantity"];
    const headerRow = document.createElement("tr");
    tableHeaders.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows for each item.
    for (const itemName in items) {
        const item = items[itemName];
        const row = document.createElement("tr");

        // Format the recipe as a list.
        const recipeList = item.recipe ? item.recipe.map((ingredient) => `${ingredient.quantity} ${ingredient.item}`).join(", ") : "";

        // Add input field and calculate button.
        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.min = 1;
        const calculateButton = document.createElement("button");
        calculateButton.textContent = "Calculate";

        // Add event listener to calculate button.
        calculateButton.addEventListener("click", () => {
            const quantity = parseInt(quantityInput.value);
            if (!isNaN(quantity)) {
                const result = calculateCraftingResult(itemName, quantity, items);
                row.querySelector(".result-cell").textContent = result;
            }
        });

        row.innerHTML = `<td>${itemName}</td><td>${item.type}</td><td>${item.description}</td><td>${recipeList}</td><td class="result-cell"></td><td></td>`;
        row.querySelector("td:last-child").appendChild(quantityInput);
        row.querySelector("td:last-child").appendChild(calculateButton);
        table.appendChild(row);
    }
}

function calculateCraftingResult(itemNameToCraft, quantity, items) {
    console.log("Calculating result for:", itemNameToCraft, "Quantity:", quantity); // Debug log

    const item = items[itemNameToCraft]; // Get the item using itemName

    function calculateIngredients(itemName, quantity) {
        console.log("Calculating ingredients for:", itemName, "Quantity:", quantity); // Debug log

        if (!items[itemName]) {
            console.log("Item not found in database:", itemName); // Debug log
            return []; // Check if the item exists in the database
        }

        const ingredientItem = items[itemName];
        if (ingredientItem.type === "craftable" && ingredientItem.recipe) {
            const requiredIngredients = [];
            ingredientItem.recipe.forEach((ingredient) => {
                const ingredientName = ingredient.item;
                const requiredQuantity = ingredient.quantity * quantity;
                const ingredientIngredients = calculateIngredients(ingredientName, requiredQuantity);
                requiredIngredients.push(...ingredientIngredients);
            });
            return requiredIngredients;
        } else {
            return [{ name: itemName, quantity }];
        }
    }

    const ingredients = calculateIngredients(itemNameToCraft, quantity);

    const result = [];
    const resultItems = {};

    ingredients.forEach((ingredient) => {
        const ingredientName = ingredient.name;
        if (ingredientName !== itemNameToCraft) {
            if (resultItems[ingredientName]) {
                resultItems[ingredientName] += ingredient.quantity;
            } else {
                resultItems[ingredientName] = ingredient.quantity;
            }
        }
    });

    for (const itemName in resultItems) {
        if (resultItems[itemName] === 1) {
            result.push(`${itemName}`);
        } else {
            result.push(`${resultItems[itemName]} ${itemName}`);
        }
    }

    return result.join(", ");
}
