'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { startLoading, stopLoading } from '@/lib/redux/slices/loadingSlice';

export default function RouteLoader() {
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startLoading());

    const timer = setTimeout(() => {
      dispatch(stopLoading());
    }, 500); // adjust delay as needed

    return () => clearTimeout(timer);
  }, [pathname, dispatch]);

  return null;
}
