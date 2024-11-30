document.getElementById('getLocation').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            document.getElementById('location').innerHTML = `Широта: ${lat}, Долгота: ${long}`;
            localStorage.setItem('location', JSON.stringify({ latitude: lat, longitude: long }));
        }, function() {
            alert('Не удалось получить местоположение.');
        });
    } else {
        alert('Geolocation не поддерживается браузером.');
    }
});

document.getElementById('saveLocalStorage').addEventListener('click', function() {
    const comment = document.getElementById('comment').value;
    const locationData = JSON.parse(localStorage.getItem('location'));

    if (comment && locationData) {
        const savedComments = JSON.parse(localStorage.getItem('comments')) || [];
        savedComments.push({ comment, location: locationData });
        localStorage.setItem('comments', JSON.stringify(savedComments));
        renderLocalStorageList();
    } else {
        alert('Введите комментарий и определите местоположение.');
    }
});

function renderLocalStorageList() {
    const localStorageList = document.getElementById('localStorageList');
    localStorageList.innerHTML = '';
    const savedComments = JSON.parse(localStorage.getItem('comments')) || [];
    
    savedComments.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.comment} (Широта: ${item.location.latitude}, Долгота: ${item.location.longitude})`;
        localStorageList.appendChild(li);
    });
}

renderLocalStorageList();

let db;
const request = indexedDB.open("geoCommentsDB", 1);
request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("comments", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    renderIndexedDBList();
};

document.getElementById('saveIndexedDB').addEventListener('click', function() {
    const comment = document.getElementById('comment').value;
    const locationData = JSON.parse(localStorage.getItem('location'));

    if (comment && locationData) {
        const transaction = db.transaction(["comments"], "readwrite");
        const objectStore = transaction.objectStore("comments");
        const newComment = { comment, location: locationData };
        objectStore.add(newComment).onsuccess = function() {
            renderIndexedDBList();
        };
    } else {
