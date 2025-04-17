import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';

export function withAuth(Component) {
    return function ProtectedRoute(props) {
        const router = useRouter();

        useEffect(() => {
            if (!isAuthenticated()) {
                router.push('/login');
            }
        }, []);

        return <Component {...props} />;
    };
} 