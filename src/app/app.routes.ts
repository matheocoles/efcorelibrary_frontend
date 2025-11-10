import {Routes} from '@angular/router';

export const routes: Routes = [
    {path: '', pathMatch: 'full', redirectTo: '/welcome'},
    {path: 'welcome',
        loadComponent: () => import('./pages/welcome/welcome').then(m => m.Welcome),
    },
    {
        path: 'authors',
        loadComponent: () => import('./pages/authors/authors').then(m => m.Authors),
        children: [
            {
                path: 'addauthors',
                loadComponent: () => import('./components/popup/addauthors/addauthors').then(m => m.Addauthors),
            }
        ]
    },
    {
        path: 'books',
        loadComponent: () => import('./pages/books/books').then(m => m.Books),
    },
    {
        path: 'loans',
        loadComponent: () => import('./pages/loans/loans').then(m => m.Loans),
    },
    {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then(m => m.Users),
    }
];
