import * as apiService from "./api.js";
import * as fireStore from "./cloudstore.js";

async function populateBasket() {
    document.querySelector('#loading').classList.remove('hidden');

    const basket = JSON.parse(localStorage.getItem('basket'));
    document.querySelector('#basket').innerHTML = '';

    if (basket === null || basket.length === 0) {
        document.querySelector('#loading').classList.add('hidden');
        document.querySelector('#order').disabled = true;
        return;
    }
    try {
        let totalPrice = 0;
        for (const item of basket) {
            const currentItem = await apiService.get(`inventory?id=${item.id}`);
            const $itemTemplate = document.querySelector("#item-template").content.firstElementChild.cloneNode(true);
            $itemTemplate.querySelector(".item-description").innerHTML = `${currentItem.name} - ${currentItem.alcohol}%`;
            $itemTemplate.querySelector(".item-quantity").innerHTML = `${item.quantity}x`;
            $itemTemplate.querySelector(".item-total-price").innerHTML = `€${currentItem.price * item.quantity}`;
            $itemTemplate.dataset.itemId = currentItem.id;
            totalPrice += currentItem.price * item.quantity;
            document.querySelector('#basket').insertAdjacentHTML('beforeend', $itemTemplate.outerHTML);
        }
        document.querySelector('#loading').classList.add('hidden');
        document.querySelectorAll('.item-container').forEach(item => {
            item.classList.remove('hidden');
        });
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
                document.querySelector('#save').innerText = 'Opslaan';
                document.querySelector('#save').classList.remove('delete');
                document.querySelector('#save').dataset.itemId = e.currentTarget.dataset.itemId;
            });
        });
        if (totalPrice === 0) {
            document.querySelector('#basket').insertAdjacentHTML('beforeend', `<p class="empty-basket">Uw bestelling is leeg</p>`)
        } else {
            document.querySelector('#basket').insertAdjacentHTML('beforeend', `<p class="total-price">€${totalPrice}</p>`)
        }

    } catch (error) {
        console.error(error);
    }
}

await populateBasket();

document.querySelector('#order').addEventListener('click', async () => {
    document.querySelector('dialog').showModal();
});

const tables = await apiService.get('tables');
tables.forEach(table => {
    const $option = document.createElement('option');
    $option.value = table.id;
    $option.innerText = `${table.id}`;
    document.querySelector('select').appendChild($option);
});

document.querySelectorAll('.dialog-close').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('dialog').close();
    });
});
document.querySelectorAll('.back').forEach(element => {
    element.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

document.querySelector('dialog form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (document.querySelector('select').value === '') {
        document.querySelector('select').style.border = '1px solid red';
        return;
    }
    const order = {
        table: document.querySelector('select').value,
        remark: document.querySelector('#remark').value,
        items: JSON.parse(localStorage.getItem('basket'))
    }
    await fireStore.addOrder(order)
    await apiService.post('order', order);
    localStorage.setItem('basket', JSON.stringify([]));

    document.querySelector('#table-dialog').close();
    document.querySelector('#thanks-dialog').showModal();
});

document.querySelector('#minus').addEventListener('click', (e) => {
    e.preventDefault();
    if (document.querySelector('#quantity').innerText > 0) {
        document.querySelector('#quantity').innerText--;
        if (document.querySelector('#quantity').innerText === '0') {
            document.querySelector('#save').innerText = 'Verwijderen';
            document.querySelector('#save').classList.add('delete');
        }
    }
});

document.querySelector('#plus').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#save').innerText = 'Opslaan';
    document.querySelector('#save').classList.remove('delete');
    document.querySelector('#quantity').innerText++;
});

const basketArray = JSON.parse(localStorage.getItem('basket'));
// Check if 'basket' item in local storage is not empty
if (basketArray?.length > 0) {
    // Get the #basket element
    const basketElement = document.getElementById('basket');

    // Remove the 'hidden' class from the element
    basketElement.classList.remove('hidden');
}

document.querySelector('#save').addEventListener('click', async (e) => {
    e.preventDefault();
    document.querySelector('#selected-item').classList.add('hidden');
    const basket = JSON.parse(localStorage.getItem('basket'));
    const item = basket.find(item => item.id === e.target.dataset.itemId);
    if (item) {
        item.quantity = parseInt(document.querySelector('#quantity').innerText);
        if (item.quantity < 1) {
            basket.splice(basket.indexOf(item), 1);
            if (basket.length === 0) {
                document.querySelector('#order').disabled = true;
            }
        }
    } else {
        basket.push({
            id: e.target.dataset.itemId,
            quantity: document.querySelector('#quantity').innerText
        });
    }

    localStorage.setItem('basket', JSON.stringify(basket));
    await populateBasket();
});

document.querySelector('#close-selected-item').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#selected-item').classList.add('hidden');
});
