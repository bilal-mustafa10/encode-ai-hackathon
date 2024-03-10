// complimentsAndComments.ts
export interface IUserInfo {
    image: number;
    name: number;
}


export const userInfo: IUserInfo[]  =  [
    {image: require('../assets/images/users/user-1.jpg'), name: 'Jane P.'},
    {image: require('../assets/images/users/user-2.jpg'), name: 'John S.'},
    {image: require('../assets/images/users/user-3.jpg'), name: 'Sara T.'},
    {image: require('../assets/images/users/user-4.jpg'), name: 'Mike R.'},
    {image: require('../assets/images/users/user-5.jpg'), name: 'Lara C.'},
    {image: require('../assets/images/users/user-6.jpg'), name: 'Sara T.'},
    {image: require('../assets/images/users/user-7.jpg'), name: 'John S.'},
    {image: require('../assets/images/users/user-8.jpg'), name: 'Mike R.'},
    {image: require('../assets/images/users/user-9.jpg'), name: 'Lara C.'},
    {image: require('../assets/images/users/user-10.jpg'), name: 'Jane P.'}
];
