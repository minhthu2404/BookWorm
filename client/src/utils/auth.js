export const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Lỗi khi đọc dữ liệu user:', error);
            localStorage.removeItem('user');
            return null;
        }
    }
    return null;
};

export const setUser = (user) => {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('user-updated'));
    }
};

export const removeUser = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-updated'));
};
