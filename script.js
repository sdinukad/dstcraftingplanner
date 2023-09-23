    document.addEventListener("DOMContentLoaded", function () {
        // Load the crafting data from the JSON file.
        fetch("/db/db.json")
        .then((response) => response.json())
        .then((data) => {
            // Populate the crafting table with data.
            populateCraftingTable(data.items);
        })
        .catch((error) => console.error("Error loading crafting data:", error));
    });
    
    function populateCraftingTable(items) {
        const table = document.getElementById("crafting-table");
        
        // Create table headers.
        const tableHeaders = ["Item", "Description", "Recipe", "Requirements", "Quantity"];
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
        if (item.type === "collectable") {
            continue; // Skip collectable items when crafting is selected
        }
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
    
        row.innerHTML = `<td>${itemName}</td><td>${item.description}</td><td>${recipeList}</td><td class="result-cell"></td><td></td>`;
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
            
    
    