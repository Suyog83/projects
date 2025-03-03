// This file contains the JavaScript code for the Electricity Billing System.
// It handles user interactions, calculations for billing, and dynamic content updates.

document.addEventListener('DOMContentLoaded', function() {
    // Initialize storage
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    let recentBills = JSON.parse(localStorage.getItem('recentBills')) || [];

    // Form elements
    const customerForm = document.getElementById('customer-form');
    const billingForm = document.getElementById('billing-form');
    const billOutput = document.getElementById('bill-output');
    const billAmount = document.getElementById('bill-amount');
    const recentBillsContainer = document.getElementById('recent-bills');

    // Define electricity rate slabs
    const rateSlabs = [
        { units: 50, rate: 3.50 },    // First 50 units
        { units: 100, rate: 4.00 },   // 51-150 units
        { units: 200, rate: 5.20 },   // 151-300 units
        { units: Infinity, rate: 6.50 } // Above 300 units
    ];

    function calculateBill(unitsConsumed) {
        let totalBill = 0;
        let remainingUnits = unitsConsumed;
        let currentSlabIndex = 0;

        while (remainingUnits > 0 && currentSlabIndex < rateSlabs.length) {
            const currentSlab = rateSlabs[currentSlabIndex];
            const unitsInThisSlab = Math.min(
                remainingUnits,
                currentSlabIndex === 0 ? currentSlab.units : 
                currentSlab.units - rateSlabs[currentSlabIndex - 1].units
            );

            totalBill += unitsInThisSlab * currentSlab.rate;
            remainingUnits -= unitsInThisSlab;
            currentSlabIndex++;
        }

        // Add fixed charges
        const fixedCharge = 50;
        totalBill += fixedCharge;

        return totalBill;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function saveToLocalStorage() {
        localStorage.setItem('customers', JSON.stringify(customers));
        localStorage.setItem('recentBills', JSON.stringify(recentBills));
    }

    function displayRecentBills() {
        recentBillsContainer.innerHTML = '';
        recentBills.slice(0, 5).forEach(bill => {
            const billCard = document.createElement('div');
            billCard.className = 'bill-card';
            billCard.innerHTML = `
                <h3>Bill for ${bill.customerName}</h3>
                <div class="bill-info">
                    <p><strong>Customer ID:</strong> ${bill.customerId}</p>
                    <p><strong>Units:</strong> ${bill.units}</p>
                    <p><strong>Amount:</strong> ${formatCurrency(bill.totalAmount)}</p>
                    <p class="bill-date">${formatDate(bill.date)}</p>
                </div>
            `;
            recentBillsContainer.appendChild(billCard);
        });
    }

    // Handle customer form submission
    customerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const customerId = document.getElementById('customer-id').value;
        const customerName = document.getElementById('customer-name').value;
        const customerAddress = document.getElementById('customer-address').value;
        const customerPhone = document.getElementById('customer-phone').value;

        // Check if customer ID already exists
        if (customers.some(c => c.id === customerId)) {
            alert('Customer ID already exists!');
            return;
        }

        // Add new customer
        customers.push({
            id: customerId,
            name: customerName,
            address: customerAddress,
            phone: customerPhone
        });

        saveToLocalStorage();
        customerForm.reset();
        alert('Customer added successfully!');
    });

    // Handle billing form submission
    billingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const customerId = document.getElementById('billing-customer-id').value;
        const unitsConsumed = parseFloat(document.getElementById('units-consumed').value);

        // Find customer
        const customer = customers.find(c => c.id === customerId);
        if (!customer) {
            alert('Customer not found! Please check the Customer ID.');
            return;
        }

        if (isNaN(unitsConsumed) || unitsConsumed < 0) {
            alert('Please enter valid units consumed');
            return;
        }

        const totalBill = calculateBill(unitsConsumed);

        // Create bill record
        const bill = {
            customerId,
            customerName: customer.name,
            units: unitsConsumed,
            totalAmount: totalBill,
            date: new Date().toISOString()
        };

        // Add to recent bills
        recentBills.unshift(bill);
        if (recentBills.length > 10) recentBills.pop(); // Keep only last 10 bills
        saveToLocalStorage();

        // Display bill
        let billDetails = `
            <h3>Bill Details for ${customer.name}</h3>
            <div class="bill-details">
                <p><strong>Customer ID:</strong> ${customerId}</p>
                <p><strong>Address:</strong> ${customer.address}</p>
                <p><strong>Phone:</strong> ${customer.phone}</p>
                <p><strong>Units Consumed:</strong> ${unitsConsumed}</p>
                <p><strong>Fixed Charges:</strong> ${formatCurrency(50)}</p>
                <p><strong>Energy Charges:</strong> ${formatCurrency(totalBill - 50)}</p>
                <p class="total"><strong>Total Amount:</strong> ${formatCurrency(totalBill)}</p>
                <p class="bill-date">Generated on: ${formatDate(bill.date)}</p>
            </div>
        `;

        billAmount.innerHTML = billDetails;
        billOutput.style.display = 'block';
        billOutput.scrollIntoView({ behavior: 'smooth' });

        // Update recent bills display
        displayRecentBills();
    });

    // Initial display of recent bills
    displayRecentBills();
});