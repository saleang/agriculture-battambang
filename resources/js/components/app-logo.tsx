// import AppLogoIcon from './app-logo-icon';
import Logo from '@/assets/logo.png';


export default function AppLogo() {
    return (
        // <>
        //     <div className="flex aspect-square w-50 items-center justify-center h-50 bg-sidebar-primary text-sidebar-primary-foreground">
        //         {/* <AppLogoIcon className="size-5 fill-current text-white dark:text-black" /> */}
        //          <img 
        //             src={Logo} 
        //             alt="App Logo" 
        //             className="size-50 fill-current text-white dark:text-black "
        //         />
        //     </div>
        //     {/* <div className="ml-1 grid flex-1 text-left text-sm">
        //         <span className="mb-0.5 truncate leading-tight font-semibold">
        //             Agriculture Platform
        //         </span>
        //     </div> */}
        // </>
         <div className="flex items-center justify-center">
            <img
                src={Logo}
                alt="App Logo"
                className="w-[200px] h-[100px] "
            />
        </div>
    );
}
