// import AppLogoIcon from './app-logo-icon';
import Logo from '@/assets/logo.png';
import { Link } from '@inertiajs/react';


export default function AppLogo() {
    return (
        <Link href="/">
            <div className="flex items-center justify-center">
                <img
                    src={Logo}
                    alt="App Logo"
                    className="w-[100px] h-[100px] "
                />
            </div>
        </Link>
    );
}