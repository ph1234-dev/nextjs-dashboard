'use client';
// "use client" - This is a Client Component, which means you can use event listeners and hooks.

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams , usePathname, useRouter} from 'next/navigation';
// Import the useSearchParams hook from next/navigation and assign it to a variable:


import { useDebouncedCallback } from 'use-debounce';
// You're updating the URL on every keystroke, and therefore querying your database on every keystroke! This isn't a problem as our application is small, but imagine if your application had thousands of users, each sending a new request to your database on each keystroke.

// Debouncing is a programming practice that limits the rate at which a function can fire. In our case, you only want to query the database when the user has stopped typing.

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();


  // Inside the Search Component...
  const handleSearch = useDebouncedCallback((term) => {

    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);

    params.set('page', '1');
    // Finally, when the user types a new search query, you want to reset the page number to 1. You can do this by updating the handleSearch function in your <Search> component:

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
