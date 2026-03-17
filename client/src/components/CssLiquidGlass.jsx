import { useEffect, useRef, useState } from 'react';
import styles from './cssliquid.module.css';

const svg = `<svg width="100%" height="100%" viewBox="0 0 100% 100%" xmlns="http://www.w3.org/2000/svg">
  <filter id="liquid-glass-filter">
    <feImage
      xlink:href="data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 100% 100%' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='rgb%280 0 0 %2F100 / 2.55}%25%29' /%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='%23FFF' style='filter:blur(10}px)' /%3E%3C/svg%3E"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      result="first"
      id="first"
    />
    <feImage
      xlink:href="data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 100% 100%' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='rgb%28255 255 255 %2F0 / 2.55}%25%29' style='filter:blur(0px)' /%3E%3C/svg%3E"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      result="second"
      id="second"
    />
    <feImage
      xlink:href="data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 100% 100%' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='%23000' /%3E%3C/svg%3E"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      result="third"
      id="third"
    />
    <feImage
      xlink:href="data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 100% 100%' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='gradient1' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23000'/%3E%3Cstop offset='100%25' stop-color='%2300F'/%3E%3C/linearGradient%3E%3ClinearGradient id='gradient2' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23000'/%3E%3Cstop offset='100%25' stop-color='%230F0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='%237F7F7F' /%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='%23000' /%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='url(%23gradient1)' style='mix-blend-mode: screen' /%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='url(%23gradient2)' style='mix-blend-mode: screen' /%3E%3Crect x='0' y='0' width='100%' height='100%' rx='32' fill='rgb%28127 127 127 %2F76.07843137254902%25%29' style='filter:blur(7px)' /%3E%3C/svg%3E"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      result="fourth"
      id="fourth"
    />
    <feTurbulence
      type="fractalNoise"
      baseFrequency="0.01 0.01"
      numOctaves="2"
      seed="92"
      result="noise"
    />
    <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
    <feGaussianBlur
      stdDeviation="0"
      id="preblur"
      in="SourceGraphic"
      result="preblur"
    />
    <feOffset dx="43" dy="43" in="preblur" result="preblurOffset" />
    <feDisplacementMap
      in="preblurOffset"
      in2="blurred"
      scale="0"
      xChannelSelector="R"
      yChannelSelector="G"
      result="displaced"
    />
    <feDisplacementMap
      id="dispR"
      in2="fourth"
      in="displaced"
      scale="-145"
      xChannelSelector="B"
      yChannelSelector="G"
    />
    <feColorMatrix
      type="matrix"
      values="1 0 0 0 0
            0 0 0 0 0
            0 0 0 0 0
            0 0 0 1 0"
      result="disp1"
    />
    <feDisplacementMap
      id="dispG"
      in2="fourth"
      in="displaced"
      scale="-150"
      xChannelSelector="B"
      yChannelSelector="G"
    />
    <feColorMatrix
      type="matrix"
      values="0 0 0 0 0
            0 1 0 0 0
            0 0 0 0 0
            0 0 0 1 0"
      result="disp2"
    />
    <feDisplacementMap
      id="dispB"
      in2="fourth"
      in="displaced"
      scale="-155"
      xChannelSelector="B"
      yChannelSelector="G"
    />
    <feColorMatrix
      type="matrix"
      values="0 0 0 0 0
            0 0 0 0 0
            0 0 1 0 0
            0 0 0 1 0"
      result="disp3"
    />
    <feBlend in2="disp2" mode="screen" />
    <feBlend in2="disp1" mode="screen" />
    <feGaussianBlur stdDeviation="0" id="postblur" />
    <feBlend in2="second" mode="screen" />
    <feBlend in2="first" mode="multiply" />
    <feComposite in2="third" operator="in" />
  </filter>
</svg>`;

export default function LiquidGlass({
  children,
  className = '',
  mode = 'manual',
  as: Tag = 'div',
  ...props
}) {
  const ref = useRef(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (mode !== 'manual') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isChromium =
      userAgent.includes('chrome') ||
      userAgent.includes('edg') ||
      userAgent.includes('opr') ||
      userAgent.includes('opera');

    const element = ref.current;
    if (!element) return;

    if (isChromium) {
      if (!element.querySelector('#liquid-glass-filter')) {
        element.insertAdjacentHTML('beforeend', svg);
      }
    } else {
      setIsFallback(true);
    }
  }, [mode]);

  let moduleClass = '';

  if (mode === 'auto') {
    moduleClass = styles['liquid-glass-auto'];
  } else {
    moduleClass = isFallback
      ? styles['liquid-glass-fallback']
      : styles['liquid-glass'];
  }

  return (
    <Tag
      ref={ref}
      className={`${moduleClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}