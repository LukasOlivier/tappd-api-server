import * as apiService from "./api.js";
import * as fireStore from "./cloudstore.js";

let intervalId; // Declare a variable to store the interval ID

async function populateOrders(force = false) {
    showFireStoreOrders();
    return;
    document.querySelector('#loading')?.classList.remove('hidden');

    apiService.get('orders', localStorage.getItem('token')).then(async orders => {
        if (orders.length === parseInt(localStorage.getItem('previous')) && !force) return;
        localStorage.setItem('previous', orders.length);
        document.querySelector('#orders').innerHTML = '';
        if (!document.querySelector('#show-all').checked) {
            orders = orders.filter(order => order.status !== 'complete');
        }
        if (orders.length > 0) {
            document.querySelector('#no-orders').classList.add('hidden');
        } else {
            document.querySelector('#no-orders').classList.remove('hidden');
        }

        for (const order of orders) {
            const $orderTemplate = document.querySelector("#order-template").content.firstElementChild.cloneNode(true);
            $orderTemplate.querySelector(".order-table").innerText = `Tafel ${order.table_id}`;
            $orderTemplate.querySelector(".order-total").innerText = `€${order.total_price}`;
            if (order.remark !== null) {
                $orderTemplate.querySelector(".remark").innerText = `${order.remark}`;
            }
            if (order.status === 'pending') {
                $orderTemplate.querySelector(".order-status").classList.remove('new');
                $orderTemplate.querySelector(".order-status").innerText = 'bezig';
            } else if (order.status === 'complete') {
                $orderTemplate.querySelector(".order-status").classList.remove('pending');

                $orderTemplate.querySelector(".order-status").classList.add('complete');
                $orderTemplate.querySelector(".order-status").disabled = true;


                $orderTemplate.querySelector(".order-status").innerText = 'compleet';
            } else {
                $orderTemplate.querySelector(".order-status").innerText = 'nieuw';
            }
            $orderTemplate.querySelector(".order-status").dataset.orderNumber = order.order_number;

            for (const item of JSON.parse(order.order_items)) {
                const $itemTemplate = document.querySelector("#item-template").content.firstElementChild.cloneNode(true);
                const itemFromDb = await apiService.get(`inventory?id=${item.id}`);
                $itemTemplate.querySelector(".item-name").innerText = itemFromDb.name;
                $itemTemplate.querySelector(".item-price").innerText = `€${itemFromDb.price}`;
                $itemTemplate.querySelector(".item-quantity").innerHTML = `${item.quantity} &times;`;
                $orderTemplate.querySelector('ul').insertAdjacentHTML('beforeend', $itemTemplate.outerHTML);
            }

            document.querySelector('#orders').insertAdjacentHTML('beforeend', $orderTemplate.outerHTML);
        }
        document.querySelectorAll('.order-container').forEach(item => {
            item.classList.remove('hidden');
        });
        document.querySelector('#loading')?.classList.add('hidden');

        // Attach event listeners after orders are added to the DOM
        document.querySelectorAll('.order-status').forEach($button => {
            $button.addEventListener('click', async (e) => {
                await apiService.update(`order/${e.target.dataset.orderNumber}`, {status: 'complete'}, localStorage.getItem('token'));
                await populateOrders(force = true);
            });
        });
    });
}

function showFireStoreOrders(force = false){
    console.log('showing firestore orders');
    document.querySelector('#loading')?.classList.remove('hidden');

    fireStore.getOrders().then(async orders => {
        if (orders.length === parseInt(localStorage.getItem('previous')) && !force) return;
        localStorage.setItem('previous', orders.length);
        document.querySelector('#orders').innerHTML = '';
        if (!document.querySelector('#show-all').checked) {
            orders = orders.filter(order => order.status !== 'complete');
        }
        if (orders.length > 0) {
            document.querySelector('#no-orders').classList.add('hidden');
        } else {
            document.querySelector('#no-orders').classList.remove('hidden');
        }

        for (const order of orders) {
            const $orderTemplate = document.querySelector("#order-template").content.firstElementChild.cloneNode(true);
            $orderTemplate.querySelector(".order-table").innerText = `Tafel ${order.order.table}`;
            const orderItems = [];
            for (const item of order.order.items) {
                await apiService.get(`inventory?id=${item.id}`).then(itemFromDb => {
                    orderItems.push(itemFromDb);
                });
            }
            console.log(orderItems);
            let totalPrice = orderItems.reduce((total, item) => total + item.price, 0);
            $orderTemplate.querySelector(".order-total").innerText = `€${totalPrice}`;
            if (order.order.remark !== null && order.order.remark !== undefined) {
                $orderTemplate.querySelector(".remark").innerText = `${order.order.remark}`;
            }
            if (order.status === 'pending') {
                $orderTemplate.querySelector(".order-status").classList.remove('new');
                $orderTemplate.querySelector(".order-status").innerText = 'bezig';
            } else if (order.status === 'complete') {
                $orderTemplate.querySelector(".order-status").classList.remove('pending');

                $orderTemplate.querySelector(".order-status").classList.add('complete');
                $orderTemplate.querySelector(".order-status").disabled = true;


                $orderTemplate.querySelector(".order-status").innerText = 'compleet';
            } else {
                $orderTemplate.querySelector(".order-status").innerText = 'nieuw';
            }
            $orderTemplate.querySelector(".order-status").dataset.orderNumber = order.order_number;

            for (const item of order.order.items) {
                const $itemTemplate = document.querySelector("#item-template").content.firstElementChild.cloneNode(true);
                const itemFromDb = await apiService.get(`inventory?id=${item.id}`);
                $itemTemplate.querySelector(".item-name").innerText = itemFromDb.name;
                $itemTemplate.querySelector(".item-price").innerText = `€${itemFromDb.price}`;
                $itemTemplate.querySelector(".item-quantity").innerHTML = `${item.quantity} &times;`;
                $orderTemplate.querySelector('ul').insertAdjacentHTML('beforeend', $itemTemplate.outerHTML);
            }

            document.querySelector('#orders').insertAdjacentHTML('beforeend', $orderTemplate.outerHTML);
        }
        document.querySelectorAll('.order-container').forEach(item => {
            item.classList.remove('hidden');
        });
        document.querySelector('#loading')?.classList.add('hidden');

        // Attach event listeners after orders are added to the DOM
        document.querySelectorAll('.order-status').forEach($button => {
            $button.addEventListener('click', async (e) => {
                await apiService.update(`order/${e.target.dataset.orderNumber}`, {status: 'complete'}, localStorage.getItem('token'));
                await populateOrders( true);
            });
        });
    });
}

document.querySelector('#show-all').checked = false;
document.querySelector('#show-all').addEventListener('click', async (e) => {
    await populateOrders(true);
});

localStorage.setItem('previous', 0);

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const $form = e.target;
    const formData = new FormData($form);
    const data = Object.fromEntries(formData.entries());
    const response = await apiService.post('login', data);
    if (response.status === 200) {
        localStorage.setItem('token', response.data.authorisation.token);
        document.querySelector('#login-section').classList.add('hidden');
        document.querySelector('.title-container').classList.remove('hidden');
        document.querySelector('#orders-section').classList.remove('hidden');
        document.querySelector('select').selectedIndex = 0;
        intervalId = setInterval(async () => {
            await populateOrders();
        }, 5000);
    } else if (response.status === 400) {
        document.querySelector('#error').classList.remove('hidden');
        document.querySelector('#error').innerText = 'Gebruikersnaam of wachtwoord is onjuist';
    } else {
        document.querySelector('#error').classList.remove('hidden');
        document.querySelector('#error').innerText = 'Er is iets misgegaan, probeer het later opnieuw';
    }
});


document.querySelector('select').addEventListener('change', async (e) => {
    document.querySelectorAll('section').forEach(item => {
        item.classList.add('hidden');
    });
    document.querySelector(`#${e.target.value}-section`).classList.remove('hidden');
    if (e.target.value === 'orders') {
        await populateOrders();
        intervalId = setInterval(async () => {
            await populateOrders();
        }, 1000);
    } else if (e.target.value === 'inventory') {
        if (intervalId) {
            clearInterval(intervalId);
        }
        await populateInventory();
    } else if (e.target.value === 'categories') {
        if (intervalId) {
            clearInterval(intervalId);
        }
        await populateCategories();
    } else {
        if (intervalId) {
            clearInterval(intervalId);
        }
        await populateTables();
    }
});

async function populateInventory() {
    const inventory = await apiService.get('items');
    document.querySelector('#inventory').innerHTML = '';
    for (const item of inventory) {
        const $itemTemplate = document.querySelector("#item-template").content.firstElementChild.cloneNode(true);
        $itemTemplate.querySelector(".item-name").innerText = item.name;
        $itemTemplate.querySelector(".item-name").after(` -`);
        $itemTemplate.querySelector(".item-category").innerText = `${item.category}`;
        $itemTemplate.querySelector(".item-price").innerText = `€${item.price}`;

        $itemTemplate.dataset.itemId = item.id;
        document.querySelector('#inventory').insertAdjacentHTML('beforeend', $itemTemplate.outerHTML);
    }
    document.querySelectorAll('.item-container').forEach(item => {
        item.addEventListener('click', async (e) => {
            document.querySelector('#item-dialog').showModal();
            document.querySelector('#item-dialog').querySelector('#item-name').value = e.currentTarget.querySelector('.item-name').innerText;
            document.querySelector('#item-dialog').querySelector('#item-price').value = parseInt(e.currentTarget.querySelector('.item-price').innerText.replace('€', ''));
            document.querySelector('#item-dialog').querySelector('#item-category').value = e.currentTarget.querySelector('.item-category').innerText;
            document.querySelector('#delete-item').classList.remove('hidden');
            document.querySelector('#item-dialog').dataset.itemId = e.currentTarget.dataset.itemId;
        });
    });
}

const data = await apiService.get('categories');

for (const category in data) {
    document.querySelector('dialog select').insertAdjacentHTML('beforeend', `<option value="${data[category][0].category}">${data[category][0].category}</option>`);

}
document.querySelectorAll('.close-dialog').forEach(item => {
    item.addEventListener('click', async (e) => {
        document.querySelectorAll('dialog').forEach(dialog => {
            dialog.close();
        });
    });
});

document.querySelector('#add-item').addEventListener('click', async (e) => {
    document.querySelector('dialog').showModal();
    document.querySelector('dialog').querySelector('h1').innerText = 'Item toevoegen';
    document.querySelector('dialog').querySelector('#item-name').value = '';
    document.querySelector('dialog').querySelector('#item-price').value = '';
    document.querySelector('dialog').querySelector('#item-category').value = '';
    document.querySelector('dialog').dataset.itemId = '';
    document.querySelector('#delete-item').classList.add('hidden');
});
document.querySelectorAll('.number-input').forEach(item => {
    item.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9 \.]/, '');
    });
})

document.querySelector('#save').addEventListener('click', async (e) => {
    e.preventDefault();
    const $form = document.querySelector('#item-dialog form');
    const formData = new FormData($form);
    const data = Object.fromEntries(formData.entries());
    if (document.querySelector('dialog').dataset.itemId) {
        await apiService.update(`inventory/${document.querySelector('dialog').dataset.itemId}`, data, localStorage.getItem('token'));
    } else {
        await apiService.post('inventory', data, localStorage.getItem('token'));
    }
    await populateInventory();
    document.querySelector('#item-dialog').close();
});

document.querySelector('#delete-item').addEventListener('click', async (e) => {
    if (confirm("Dit item verwijderen?") === true) {
        apiService.remove(`inventory/${document.querySelector('dialog').dataset.itemId}`, localStorage.getItem('token')).then(async () => {
            await populateInventory();
            document.querySelector('#item-dialog').close();
        });
    }
});

async function populateCategories() {
    const data = await apiService.get('categories');
    for (const category in data) {
        document.querySelector('#categories').insertAdjacentHTML('beforeend', `<h2 class="category-item" id=${data[category][0].id}>${data[category][0].category}</h2>`);
    }
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            document.querySelector('#category-dialog').showModal();
            document.querySelector('#category-dialog').querySelector('#category-category').value = e.target.innerText;
            document.querySelector('#category-dialog').dataset.categoryId = e.target.id;
            document.querySelector('#delete-category').classList.remove('hidden');
        });
    })
}

document.querySelector('#add-category').addEventListener('click', async (e) => {
    document.querySelector('#category-dialog').showModal();
    document.querySelector('#category-dialog').querySelector('#category-category').value = '';
    document.querySelector('#category-dialog').dataset.categoryId = '';
    document.querySelector('#delete-category').classList.add('hidden');
});

document.querySelector('#save-category').addEventListener('click', async (e) => {
    e.preventDefault();
    const $form = document.querySelector('#category-dialog form');
    const formData = new FormData($form);
    const data = Object.fromEntries(formData.entries());
    if (document.querySelector('#category-dialog').dataset.categoryId) {
        await apiService.update(`category/${document.querySelector('#category-dialog').dataset.categoryId}`, data, localStorage.getItem('token'));
    } else {
        await apiService.post('category', data, localStorage.getItem('token'));
    }
    document.querySelector('#category-dialog').close();
    await populateCategories();
});

document.querySelector('#delete-category').addEventListener('click', async (e) => {
    if (confirm("Deze categorie verwijderen?") === true) {
        apiService.remove(`category/${document.querySelector('#category-dialog').dataset.categoryId}`, localStorage.getItem('token')).then(async () => {
            await populateCategories();
            document.querySelector('#category-dialog').close();
        });
    }
});

async function populateTables() {
    document.querySelector('#tables').innerHTML = '';
    const tables = await apiService.get('tables');
    for (const table of tables) {
        document.querySelector('#tables').insertAdjacentHTML('beforeend', `<li class="table-item" id=${table.id}>${table.table_number}</li>`);
    }
    document.querySelectorAll('.table-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            document.querySelector('#table-dialog').showModal();
            document.querySelector('#table-dialog').querySelector('h1').innerText = 'Tafel bewerken';
            document.querySelector('#table-dialog').querySelector('#table-number').value = e.target.innerText;
            document.querySelector('#table-dialog').dataset.tableId = e.target.id;
            document.querySelector('#delete-table').classList.remove('hidden');
        });
    });
}

document.querySelector('#add-table').addEventListener('click', async (e) => {
    document.querySelector('#table-dialog').showModal();
    document.querySelector('#table-dialog').querySelector('h1').innerText = 'Tafel toevoegen';
    document.querySelector('#table-dialog').querySelector('#table-number').value = '';
    document.querySelector('#table-dialog').dataset.tableId = '';
    document.querySelector('#delete-table').classList.add('hidden');
});

document.querySelector('#save-table').addEventListener('click', async (e) => {
    e.preventDefault();
    const $form = document.querySelector('#table-dialog form');
    const formData = new FormData($form);
    const data = Object.fromEntries(formData.entries());
    if (document.querySelector('#table-dialog').dataset.tableId) {
        await apiService.update(`table/${document.querySelector('#table-dialog').dataset.tableId}`, data, localStorage.getItem('token'));
    } else {
        await apiService.post('table', data, localStorage.getItem('token'));
    }
    document.querySelector('#table-dialog').close();
    await populateTables();
});

document.querySelector('#delete-table').addEventListener('click', async (e) => {
    if (confirm("Deze tafel verwijderen?") === true) {
        apiService.remove(`table/${document.querySelector('#table-dialog').dataset.tableId}`, localStorage.getItem('token')).then(async () => {
            await populateTables();
            document.querySelector('#table-dialog').close();
        });
    }
});
/*
const DATA_COUNT = 5;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const config = {
    type: 'pie',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Pie Chart'
            }
        }
    },
};

const data = {
    labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
    datasets: [
        {
            label: 'Dataset 1',
            data: Utils.numbers(NUMBER_CFG),
            backgroundColor: Object.values(Utils.CHART_COLORS),
        }
    ]
};


 */
const ctx = document.getElementById('myChart');
const apiData = await apiService.get('categories');
const categories = [];
// take only the keys of the object
for (const category in apiData) {
    categories.push(category);
}

const pieData = {
    labels: categories,
    data: await calculateOrderAmount()
}

async function calculateOrderAmount() {
    const orders = await apiService.get('orders', localStorage.getItem('token'))
    const categoryAmount = {}
    const orderItems = []
    const orderItemsFromDb = []

    for (const order of orders) {
        for (const item of JSON.parse(order.order_items)) {
            orderItems.push(item)
        }
    }

    for (const orderItem of orderItems) {

        const itemFromDb = await apiService.get(`inventory?id=${orderItem.id}`)
        for (let i = 0; i < orderItem.quantity; i++) {
            orderItemsFromDb.push(itemFromDb)
        }
    }

    for (const category of categories) {
        categoryAmount[category] = 0
        for (const item of orderItemsFromDb) {
            if (item.category === category) {
                categoryAmount[category] += 1
            }
        }
    }

    document.querySelector('#myChart').insertAdjacentHTML('afterend', `<div class="top-sold">
    <h2>Top 5 meest verkochte items</h2>
    <ul id="top-sold-items">
    </ul>
    </div>`)


    const topSoldItems = {};
    for (const orderItem of orderItemsFromDb) {
        if (topSoldItems[orderItem.name]) {
            topSoldItems[orderItem.name] += 1
        } else {
            topSoldItems[orderItem.name] = 1
        }
    }

    for (let i = 0; i < 5; i++) {
        const topSoldItem = Object.keys(topSoldItems).reduce((a, b) => topSoldItems[a] > topSoldItems[b] ? a : b);
        document.querySelector('#top-sold-items').insertAdjacentHTML('beforeend', `<li class="item-container"><p>${topSoldItem} - ${topSoldItems[topSoldItem]}x</p></li>`)
        delete topSoldItems[topSoldItem]
    }

    return Object.values(categoryAmount)
}





new Chart(ctx, {
    type: 'bar',
    size: 100,
    data: {
        labels: pieData.labels,
        datasets: [{
            label: 'Aantal besteld',
            data: pieData.data,
            borderWidth: 1,
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
            ],
               hoverOffset: 4
        }]
    },

    options: {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }

    }

});

