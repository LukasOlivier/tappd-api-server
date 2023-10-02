import * as apiService from './api.js';

let CURRENT_PAGE = 1;

async function populateItems($category = "all", $search = "") {
    console.log('loading');
    const data = await apiService.get(`inventory?category=${$category}&search=${$search}&page=${CURRENT_PAGE}&pageSize=20`);
    const inventory = groupByCategory(data.items);
    if (checkIfEmpty(inventory)) {
        return;
    }
    document.querySelector('#not-found-message').classList.add('hidden');
    const dataDiv = document.getElementById('data');

    if (CURRENT_PAGE === 1) {
        dataDiv.innerHTML = '';
        toggleLoading();
    }
    for (const category in inventory) {
        renderCategory(category, dataDiv);
        for (const item of inventory[category]) {
            renderItem(item, category, dataDiv);
        }
    }

    document.querySelectorAll('.item-container').forEach(item => {
        item.addEventListener('click', async (e) => {
            document.querySelector('#selected-item-description').innerText = e.currentTarget.querySelector('.item-description').innerText;
            const basket = JSON.parse(localStorage.getItem('basket'));
            const item = basket.find(item => item.id === e.currentTarget.dataset.itemId);
            if (item) {
                document.querySelector('#quantity').innerText = item.quantity;
            } else {
                document.querySelector('#quantity').innerText = 1;
            }
            document.querySelector('#selected-item').classList.remove('hidden');
            document.querySelector('#add-to-basket').dataset.itemId = e.currentTarget.dataset.itemId;
        });
    });
}

// add an eventlistener that detects if the user scrolled to the bottom of the data div
document.addEventListener('scroll', async (e) => {
    e.preventDefault();
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
    if (window.scrollY >= scrollableHeight) {
        CURRENT_PAGE++;
        await populateItems(document.querySelector('.selected')?.innerText.toLowerCase(), document.querySelector('#search').value.toLowerCase());
    }
})

function renderCategory(category, dataDiv) {
    if (dataDiv.querySelector(`#${category}`)) {
        return;
    }
    const $categoryTemplate = document.querySelector("#category-template").content.firstElementChild.cloneNode(true);
    $categoryTemplate.querySelector(".category-title").innerText = category;
    $categoryTemplate.querySelector('ul').id = category;
    dataDiv.insertAdjacentHTML('beforeend', $categoryTemplate.outerHTML);
}

function renderItem(item, category, dataDiv) {
    const $itemTemplate = document.querySelector("#item-template").content.firstElementChild.cloneNode(true);
    $itemTemplate.dataset.itemId = item.id;
    if (item.alcohol > 0) {
        $itemTemplate.querySelector(".item-description").innerHTML = `${item.name} - ${item.alcohol}%`;
    } else {
        $itemTemplate.querySelector(".item-description").innerHTML = `${item.name}`;
    }
    $itemTemplate.querySelector(".item-price").innerHTML = `€${item.price}`;

    dataDiv.querySelector(`#${category}`).insertAdjacentHTML('beforeend', $itemTemplate.outerHTML);

}

function toggleLoading() {
    document.querySelector('#data').classList.toggle('hidden');
    document.querySelector('#loading').classList.toggle('hidden');
}

function checkIfEmpty(inventory) {
    if (inventory.length === 0) {
        document.querySelector('#data').classList.add('hidden');
        document.querySelector('#not-found-message').classList.remove('hidden');
        return true;
    }
    return false;
}

function groupByCategory(data) {
    const groupedData = {};
    for (const item of data) {
        if (!groupedData[item.category]) {
            groupedData[item.category] = [];
        }
        groupedData[item.category].push(item);
    }
    return groupedData;
}

async function populateCategories() {
    try {
        const data = await apiService.get('categories');
        // sort the categories alphabetically

        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = '';
        for (const [id, category] of Object.entries(data)) {
            const $categoryButton = `<button class="category-button" data-category-id="${id}">${category}</button>`;
            categoriesList.insertAdjacentHTML('beforeend', $categoryButton)
            //renderCategory(category, document.getElementById('data'));
        }
        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                clearSelectedCategory();
                e.target.classList.add('selected');
                CURRENT_PAGE = 1;
                toggleLoading();
                await populateItems(e.target.innerText.toLowerCase(), document.querySelector('#search').value.toLowerCase());
            });
        });
    } catch (error) {
        console.error(error);
    }
}

if (localStorage.getItem('basket') === null) {
    localStorage.setItem('basket', JSON.stringify([]));
}

function clearSelectedCategory() {

    document.querySelectorAll('.category-button').forEach(button => {
        button.classList.remove('selected');
    });
}

await populateCategories()
await populateItems()


document.querySelector('#search').addEventListener('keyup', async (e) => {
    const category = document.querySelector('.selected')?.innerText.toLowerCase();
    const search = e.target.value.toLowerCase();
    await populateItems(category, search);
});

document.querySelector('#close-selected-item').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#selected-item').classList.add('hidden');
});

document.querySelector('#add-to-basket').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#selected-item').classList.add('hidden');
    const basket = JSON.parse(localStorage.getItem('basket'));
    const item = basket.find(item => item.id === e.target.dataset.itemId);
    if (item) {
        item.quantity = document.querySelector('#quantity').innerText;
    } else {
        basket.push({
            id: e.target.dataset.itemId,
            quantity: document.querySelector('#quantity').innerText
        });
    }

    localStorage.setItem('basket', JSON.stringify(basket));
    document.querySelector('#basket').classList.remove('hidden');
});
document.querySelector('#minus').addEventListener('click', (e) => {
    e.preventDefault();
    if (document.querySelector('#quantity').innerText > 1) {
        document.querySelector('#quantity').innerText--;
    }
});

document.querySelector('#plus').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#quantity').innerText++;
});

const basketArray = JSON.parse(localStorage.getItem('basket'));
// Check if 'basket' item in local storage is not empty
if (basketArray.length > 0) {
    // Get the #basket element
    const basketElement = document.getElementById('basket');

    // Remove the 'hidden' class from the element
    basketElement.classList.remove('hidden');
}

document.querySelector('#basket')?.addEventListener('click', async (e) => {
    window.location.href = "basket.html";
});
