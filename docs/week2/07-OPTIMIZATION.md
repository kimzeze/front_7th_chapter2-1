# 07. 최적화 기법

> **React 개념**: React.memo, Performance Optimization
> **난이도**: ⭐⭐⭐⭐ (어려움)
> **예상 시간**: 6-8시간

## 🎯 이번 단계의 목표

애플리케이션의 성능을 최적화하고, 불필요한 렌더링을 방지합니다.

### 구현할 기능
- ✅ 메모이제이션 (Memoization)
- ✅ 디바운싱 (Debouncing)
- ✅ 쓰로틀링 (Throttling)
- ✅ 지연 로딩 (Lazy Loading)
- ✅ 코드 스플리팅
- ✅ 성능 측정

---

## 🏗️ 구현 단계

### Step 1: React.memo 구현 (2시간)

**파일 생성**: `src/core/memo.js`

```javascript
// 컴포넌트 메모이제이션
export function memo(component, arePropsEqual) {
  const cache = new Map();

  return function MemoizedComponent(props) {
    const key = JSON.stringify(props);

    // 캐시 확인
    if (cache.has(key)) {
      const { props: cachedProps, result } = cache.get(key);

      // Props 비교
      const shouldUpdate = arePropsEqual
        ? !arePropsEqual(cachedProps, props)
        : !shallowEqual(cachedProps, props);

      if (!shouldUpdate) {
        console.log('Using cached result');
        return result;
      }
    }

    // 새로 렌더링
    console.log('Rendering component');
    const result = component(props);

    // 캐시 저장
    cache.set(key, { props: { ...props }, result });

    return result;
  };
}

// 얕은 비교
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => obj1[key] === obj2[key]);
}
```

**사용 예시**:
```javascript
// 메모이제이션된 컴포넌트
const ProductCard = memo(({ product }) => {
  console.log('Rendering ProductCard:', product.id);

  return `
    <div class="product-card">
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
    </div>
  `;
});

// Props가 변경되지 않으면 렌더링 생략
const html1 = ProductCard({ product: { id: 1, title: 'Product 1', price: 100 } });
const html2 = ProductCard({ product: { id: 1, title: 'Product 1', price: 100 } }); // 캐시 사용
```

---

### Step 2: 디바운싱과 쓰로틀링 (1.5시간)

**파일 생성**: `src/utils/performance.js`

```javascript
// 디바운싱
export function debounce(func, delay) {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 쓰로틀링
export function throttle(func, limit) {
  let inThrottle;

  return function throttled(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// RAF 기반 쓰로틀링 (스크롤 최적화)
export function rafThrottle(func) {
  let rafId;

  return function throttled(...args) {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null;
    });
  };
}
```

**사용 예시**:
```javascript
// 검색 입력 디바운싱
const searchInput = document.querySelector('.search-input');
const debouncedSearch = debounce((value) => {
  performSearch(value);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// 스크롤 이벤트 쓰로틀링
const handleScroll = rafThrottle(() => {
  const scrollY = window.scrollY;
  updateScrollPosition(scrollY);
});

window.addEventListener('scroll', handleScroll);
```

---

### Step 3: 지연 로딩 (Lazy Loading) (2시간)

**파일 생성**: `src/utils/lazyLoad.js`

```javascript
// 이미지 지연 로딩
export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
  }

  observe(element) {
    this.observer.observe(element);
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          this.observer.unobserve(img);
        }
      }
    });
  }

  disconnect() {
    this.observer.disconnect();
  }
}

// 컴포넌트 지연 로딩
export async function lazyLoadComponent(importFn) {
  const module = await importFn();
  return module.default || module;
}
```

**사용 예시**:
```javascript
// 이미지 지연 로딩
const lazyLoader = new LazyImageLoader();

const ProductCard = ({ product }) => {
  return `
    <div class="product-card">
      <img
        data-src="${product.thumbnail}"
        src="placeholder.jpg"
        class="lazy-image"
        alt="${product.title}"
      >
      <h3>${product.title}</h3>
    </div>
  `;
};

// 렌더링 후 지연 로딩 설정
document.querySelectorAll('.lazy-image').forEach(img => {
  lazyLoader.observe(img);
});

// 컴포넌트 지연 로딩
router.addRoute('/product/:id', async (params) => {
  const DetailPage = await lazyLoadComponent(
    () => import('./pages/DetailPage.js')
  );

  render(DetailPage({ productId: params.id }));
});
```

---

### Step 4: 성능 측정 (1.5시간)

**파일 생성**: `src/utils/performance-monitor.js`

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  // 성능 측정 시작
  start(label) {
    this.metrics[label] = {
      startTime: performance.now(),
      startMemory: performance.memory?.usedJSHeapSize
    };
  }

  // 성능 측정 종료
  end(label) {
    const metric = this.metrics[label];
    if (!metric) return;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    const endMemory = performance.memory?.usedJSHeapSize;
    const memoryUsed = endMemory - metric.startMemory;

    const result = {
      label,
      duration: `${duration.toFixed(2)}ms`,
      memory: this.formatBytes(memoryUsed)
    };

    console.log(`[Performance] ${label}:`, result);

    delete this.metrics[label];
    return result;
  }

  // 렌더링 성능 측정
  measureRender(component, props) {
    this.start('render');
    const result = component(props);
    this.end('render');
    return result;
  }

  // FPS 측정
  measureFPS(callback, duration = 1000) {
    let frameCount = 0;
    const startTime = performance.now();

    const countFrame = () => {
      frameCount++;
      const elapsed = performance.now() - startTime;

      if (elapsed < duration) {
        requestAnimationFrame(countFrame);
      } else {
        const fps = (frameCount / elapsed) * 1000;
        callback(fps.toFixed(2));
      }
    };

    requestAnimationFrame(countFrame);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

**사용 예시**:
```javascript
// 렌더링 성능 측정
performanceMonitor.start('page-render');
const html = HomePage({ products });
performanceMonitor.end('page-render');

// FPS 측정
performanceMonitor.measureFPS((fps) => {
  console.log(`Current FPS: ${fps}`);
});

// 컴포넌트 렌더링 시간 측정
const result = performanceMonitor.measureRender(ProductList, { products });
```

---

### Step 5: 리스트 가상화 (Virtual Scrolling) (2시간)

**파일 생성**: `src/components/VirtualList.js`

```javascript
import { Component } from '../core/Component.js';

export class VirtualList extends Component {
  constructor(props) {
    super(props);

    const {
      items = [],
      itemHeight = 100,
      containerHeight = 600,
      renderItem
    } = props;

    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.renderItem = renderItem;

    this.visibleStart = 0;
    this.visibleEnd = Math.ceil(containerHeight / itemHeight) + 1;
    this.totalHeight = items.length * itemHeight;
  }

  onMounted() {
    const container = this.element.querySelector('.virtual-list-container');

    container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll(e) {
    const scrollTop = e.target.scrollTop;

    this.visibleStart = Math.floor(scrollTop / this.itemHeight);
    this.visibleEnd = Math.ceil(
      (scrollTop + this.containerHeight) / this.itemHeight
    );

    this.update();
  }

  render() {
    const visibleItems = this.items.slice(this.visibleStart, this.visibleEnd);
    const offsetY = this.visibleStart * this.itemHeight;

    return `
      <div
        class="virtual-list-container"
        style="height: ${this.containerHeight}px; overflow-y: auto;"
      >
        <div style="height: ${this.totalHeight}px; position: relative;">
          <div style="transform: translateY(${offsetY}px);">
            ${visibleItems.map((item, index) => {
              const actualIndex = this.visibleStart + index;
              return `
                <div
                  class="virtual-list-item"
                  style="height: ${this.itemHeight}px;"
                  data-index="${actualIndex}"
                >
                  ${this.renderItem(item, actualIndex)}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
```

**사용 예시**:
```javascript
// 10,000개 아이템도 부드럽게 렌더링
const virtualList = new VirtualList({
  items: products, // 10,000개
  itemHeight: 120,
  containerHeight: 600,
  renderItem: (product) => ProductCard({ product })
});

virtualList.mount(document.getElementById('product-list'));
```

---

## ✅ 체크리스트

### 메모이제이션
- [ ] React.memo 구현
- [ ] Props 비교 동작
- [ ] 캐시 히트율 확인

### 성능 최적화
- [ ] 디바운싱 적용
- [ ] 쓰로틀링 적용
- [ ] 이미지 지연 로딩
- [ ] 컴포넌트 지연 로딩

### 측정
- [ ] 렌더링 시간 측정
- [ ] 메모리 사용량 측정
- [ ] FPS 측정
- [ ] 리스트 가상화 동작

---

## 🐛 성능 최적화 체크리스트

### 1. 렌더링 최적화
- [ ] 불필요한 리렌더링 제거
- [ ] 메모이제이션 적용
- [ ] Virtual DOM 사용

### 2. 네트워크 최적화
- [ ] 이미지 최적화 (WebP, lazy loading)
- [ ] API 요청 최소화
- [ ] 캐싱 전략

### 3. JavaScript 최적화
- [ ] 디바운싱/쓰로틀링
- [ ] 코드 스플리팅
- [ ] Tree shaking

### 4. 메모리 최적화
- [ ] 이벤트 리스너 정리
- [ ] 타이머 정리
- [ ] Observer 정리

---

## 🎓 학습 포인트

### 성능 측정 도구

1. **Chrome DevTools**
   - Performance 탭
   - Memory 탭
   - Network 탭

2. **Lighthouse**
   - 성능 점수
   - 최적화 제안

3. **Web Vitals**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

---

## 💡 실전 팁

### 1. 렌더링 최적화

```javascript
// ❌ 매번 새 객체 생성
<Component style={{ color: 'red' }} />

// ✅ 객체 재사용
const style = { color: 'red' };
<Component style={style} />
```

### 2. 이벤트 핸들러 최적화

```javascript
// ❌ 인라인 핸들러
<button onclick="() => handleClick(id)">

// ✅ 이벤트 위임
document.body.addEventListener('click', (e) => {
  if (e.target.matches('.my-button')) {
    handleClick(e.target.dataset.id);
  }
});
```

### 3. 번들 크기 최적화

```javascript
// ❌ 전체 라이브러리 import
import _ from 'lodash';

// ✅ 필요한 함수만 import
import debounce from 'lodash/debounce';
```

---

## 📖 추가 학습 자료

- [Web Performance Optimization](https://web.dev/fast/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Chrome DevTools - Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## 🎉 축하합니다!

모든 문서를 완료하셨습니다! 이제 Vanilla JavaScript로 React의 핵심 개념들을 구현할 수 있습니다.

← 처음: **[00-OVERVIEW.md로 돌아가기](./00-OVERVIEW.md)**
