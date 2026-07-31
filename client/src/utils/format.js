export const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const formatDate = (dateInput) => {
    if (!dateInput) return '';
    
    if (dateInput instanceof Date) {
        const d = String(dateInput.getDate()).padStart(2, '0');
        const m = String(dateInput.getMonth() + 1).padStart(2, '0');
        const y = dateInput.getFullYear();
        return `${d}/${m}/${y}`;
    }
    
    if (typeof dateInput === 'string') {
        let cleanStr = dateInput.includes('T') ? dateInput.split('T')[0] : dateInput;
        const parts = cleanStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        return dateInput;
    }
    
    return '';
};
