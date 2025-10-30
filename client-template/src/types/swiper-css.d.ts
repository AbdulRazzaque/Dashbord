declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';

// Fallback for any other CSS side-effect imports
declare module '*.css' {
  const content: string;
  export default content;
}
