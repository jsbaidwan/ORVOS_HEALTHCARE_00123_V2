<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=Nunito" rel="stylesheet">

    <!-- Styles -->
    @vite('resources/css/app.css')
</head> 
<body class="bg-gray-900 min-h-screen flex flex-col">
    <div id="app" class="flex-grow flex flex-col">

        <!-- Navbar Section -->
        <nav class="bg-gray-700 shadow">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <a href="{{ url('/') }}" class="text-2xl font-bold text-white hover:text-gray-300">
                    {{ config('app.name', 'Laravel') }}
                </a>

                <div class="flex items-center space-x-6">
                    @guest
                        @if (Route::has('login'))
                            <a href="{{ route('login') }}" class="text-gray-300 hover:text-white font-medium">{{ __('Login') }}</a>
                        @endif

                        @if (Route::has('register'))
                            <a href="{{ route('register') }}" class="text-gray-300 hover:text-white font-medium">{{ __('Register') }}</a>
                        @endif
                    @else
                        <div class="relative" x-data="{ open: false }">
                            <button @click="open = !open" class="flex items-center text-gray-300 hover:text-white font-medium focus:outline-none">
                                {{ Auth::user()->name }}
                                <svg class="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                </svg>
                            </button>

                            <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg py-1 z-50">
                                <a href="{{ route('logout') }}"
                                   class="block px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-white"
                                   onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                                    {{ __('Logout') }}
                                </a>

                                <form id="logout-form" action="{{ route('logout') }}" method="POST" class="hidden">
                                    @csrf
                                </form>
                            </div>
                        </div>
                    @endguest
                </div>
            </div>
        </nav>

        <!-- Content Area (Grey Background) -->
        <main class="flex-grow">
            <div class="container mx-auto px-4 py-8 rounded-lg shadow-md">
                @yield('content')
            </div>
        </main>

        <!-- Footer Section -->
        <footer class="bg-gray-700 py-4 mt-8 shadow-inner">
            <div class="container mx-auto px-4 text-center text-gray-400 text-sm">
                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </div>
        </footer>
    </div>

    <!-- AlpineJS for dropdown -->
    <script src="//unpkg.com/alpinejs" defer></script>
	  

</body>
</html>
