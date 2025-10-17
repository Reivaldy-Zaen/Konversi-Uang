document.addEventListener('DOMContentLoaded', () => {
    // === ELEMEN DOM ===
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const fromCurrencyName = document.getElementById('from-currency-name'); // Diubah
    const toCurrencyName = document.getElementById('to-currency-name');   // Diubah
    const resultDiv = document.getElementById('result');
    const swapButton = document.getElementById('swap-button');
    const rateInfo = document.getElementById('rate-info');
    const lastUpdatedSpan = document.getElementById('last-updated');
    const popularChips = document.querySelectorAll('.chip');

    const currencyNames = {
        USD: "Dolar AS", EUR: "Euro", JPY: "Yen Jepang", IDR: "Rupiah",
        GBP: "Pound Sterling", AUD: "Dolar Australia", CAD: "Dolar Kanada",
        CHF: "Franc Swiss", CNY: "Yuan Tiongkok", SGD: "Dolar Singapura",
    };

    let conversionRates = {};

    async function fetchRates() {
        try {
            const response = await fetch('api/get_rates.php');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (data.result === 'success') {
                conversionRates = data.conversion_rates;
                populateCurrencies(data.conversion_rates);
                calculateConversion();
                updateLastUpdated(data.time_last_update_unix);
            } else {
                showError('Gagal memuat data kurs.');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            showError('Terjadi masalah koneksi.');
        }
    }
    
    function populateCurrencies(rates) {
        const currencies = Object.keys(rates);
        fromCurrencySelect.innerHTML = '';
        toCurrencySelect.innerHTML = '';

        currencies.forEach(currency => {
            const option1 = new Option(`${currency}`, currency);
            const option2 = new Option(`${currency}`, currency);
            fromCurrencySelect.add(option1);
            toCurrencySelect.add(option2);
        });

        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'IDR';
        updateCurrencyNames();
    }
    
    function calculateConversion() {
        if (!Object.keys(conversionRates).length) return;

        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const amount = parseFloat(amountInput.value.replace(/\./g, '').replace(',', '.'));
        
        if (isNaN(amount) || amount <= 0) {
            resultDiv.textContent = '-';
            rateInfo.textContent = 'Masukkan jumlah yang valid';
            return;
        }

        const rateFrom = conversionRates[fromCurrency];
        const rateTo = conversionRates[toCurrency];
        const result = (amount / rateFrom) * rateTo;
        
        resultDiv.textContent = result.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const singleUnitRate = (1 / rateFrom) * rateTo;
        rateInfo.textContent = `1 ${fromCurrency} = ${singleUnitRate.toLocaleString('id-ID', {minimumFractionDigits: 4})} ${toCurrency} • Kurs real-time`;
    }

    function formatAmountInput(e) {
        let value = e.target.value.replace(/\./g, '');
        if (!isNaN(value) && value.length > 0) {
            e.target.value = parseFloat(value).toLocaleString('id-ID');
        }
    }

    function swapCurrencies() {
        [fromCurrencySelect.value, toCurrencySelect.value] = [toCurrencySelect.value, fromCurrencySelect.value];
        updateCurrencyNames();
        calculateConversion();
    }
    
    function updateCurrencyNames() {
        fromCurrencyName.textContent = currencyNames[fromCurrencySelect.value] || fromCurrencySelect.value;
        toCurrencyName.textContent = currencyNames[toCurrencySelect.value] || toCurrencySelect.value;
    }
    
    function updateLastUpdated(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000);
        const minutesAgo = Math.round((new Date() - date) / (1000 * 60));
        if (minutesAgo < 1) {
             lastUpdatedSpan.textContent = 'Baru saja';
        } else {
             lastUpdatedSpan.textContent = `Diperbarui ${minutesAgo} menit lalu`;
        }
    }
    
    function showError(message) {
        rateInfo.textContent = message;
        rateInfo.classList.add('text-danger');
    }

    amountInput.addEventListener('input', calculateConversion);
    amountInput.addEventListener('blur', formatAmountInput);
    fromCurrencySelect.addEventListener('change', () => { updateCurrencyNames(); calculateConversion(); });
    toCurrencySelect.addEventListener('change', () => { updateCurrencyNames(); calculateConversion(); });
    swapButton.addEventListener('click', swapCurrencies);
    
    popularChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const currency = chip.textContent;
            if (conversionRates[currency]) {
                toCurrencySelect.value = currency;
                updateCurrencyNames();
                calculateConversion();
            }
        });
    });

    fetchRates();
});