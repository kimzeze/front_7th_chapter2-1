# 04. 생명주기와 Effects 구현하기

> **React 개념**: `useEffect`, Component Lifecycle
> **난이도**: ⭐⭐⭐⭐ (어려움)
> **예상 시간**: 8-10시간

## 🎯 이번 단계의 목표

React의 `useEffect`를 직접 구현하고, 컴포넌트 생명주기를 관리합니다.

### 구현할 기능
- ✅ `createEffect()` - useEffect와 유사한 부수효과 처리
- ✅ Cleanup 함수
- ✅ 의존성 배열 (Dependency Array)
- ✅ 생명주기 훅 (mounted, updated, unmounted)

---

## 📚 배경 지식

### React의 useEffect

```jsx
// React의 useEffect
function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Effect (부수효과)
    fetchProduct(productId).then(setProduct);

    // Cleanup 함수
    return () => {
      console.log('Cleanup');
    };
  }, [productId]); // 의존성 배열

  return <div>{product?.title}</div>;
}
```

**핵심 개념:**
1. 컴포넌트 렌더링 **후** 실행
2. 의존성 배열의 값이 변경될 때만 재실행
3. Cleanup 함수로 이전 Effect 정리

---

## 🏗️ 구현 단계

### Step 1: createEffect 구현 (3시간)

**파일 생성**: `src/core/hooks/useEffect.js`

```javascript
// Effect 저장소
const effects = [];
let currentEffectIndex = 0;

export function createEffect(effect, deps) {
  const effectIndex = currentEffectIndex;

  // 기존 Effect 가져오기
  const oldEffect = effects[effectIndex];

  // 의존성 비교
  let hasChanged = true;
  if (oldEffect && oldEffect.deps) {
    hasChanged = deps.some((dep, i) => dep !== oldEffect.deps[i]);
  }

  if (hasChanged) {
    // Cleanup 함수 실행
    if (oldEffect && oldEffect.cleanup) {
      oldEffect.cleanup();
    }

    // 새 Effect 실행 (다음 틱에)
    Promise.resolve().then(() => {
      const cleanup = effect();

      // Effect 저장
      effects[effectIndex] = {
        effect,
        deps,
        cleanup: typeof cleanup === 'function' ? cleanup : null
      };
    });
  }

  currentEffectIndex++;
}

// Effect 인덱스 리셋
export function resetEffectIndex() {
  currentEffectIndex = 0;
}

// 모든 Effect Cleanup
export function cleanupAllEffects() {
  effects.forEach(effect => {
    if (effect && effect.cleanup) {
      effect.cleanup();
    }
  });
  effects.length = 0;
  currentEffectIndex = 0;
}
```

---

### Step 2: 생명주기 시스템 구현 (2시간)

**파일 생성**: `src/core/Lifecycle.js`

```javascript
class Lifecycle {
  constructor() {
    this.hooks = {
      beforeMount: [],
      mounted: [],
      beforeUpdate: [],
      updated: [],
      beforeUnmount: [],
      unmounted: []
    };
  }

  // Hook 등록
  on(phase, callback) {
    if (this.hooks[phase]) {
      this.hooks[phase].push(callback);
    }

    // 제거 함수 반환
    return () => this.off(phase, callback);
  }

  // Hook 제거
  off(phase, callback) {
    if (this.hooks[phase]) {
      const index = this.hooks[phase].indexOf(callback);
      if (index > -1) {
        this.hooks[phase].splice(index, 1);
      }
    }
  }

  // Hook 실행
  trigger(phase, ...args) {
    if (this.hooks[phase]) {
      this.hooks[phase].forEach(callback => callback(...args));
    }
  }

  // 모든 Hook 정리
  clear() {
    Object.keys(this.hooks).forEach(phase => {
      this.hooks[phase] = [];
    });
  }
}

export const lifecycle = new Lifecycle();
```

---

### Step 3: 컴포넌트에 생명주기 적용 (2시간)

```javascript
// src/core/Component.js 수정
import { lifecycle } from './Lifecycle.js';
import { resetEffectIndex, cleanupAllEffects } from './hooks/useEffect.js';

export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
    this.mounted = false;
  }

  // 렌더링 전 준비
  beforeRender() {
    resetEffectIndex(); // Effect 인덱스 리셋
  }

  // 렌더링
  render() {
    return '';
  }

  // DOM에 마운트
  mount(container) {
    lifecycle.trigger('beforeMount', this);
    this.beforeRender();

    const html = this.render();
    container.innerHTML = html;

    this.element = container.firstElementChild;
    this.mounted = true;

    lifecycle.trigger('mounted', this);
    this.onMounted();
  }

  // 업데이트
  update(newProps) {
    if (!this.mounted) return;

    lifecycle.trigger('beforeUpdate', this, newProps);
    this.beforeRender();

    this.props = { ...this.props, ...newProps };
    const html = this.render();

    if (this.element) {
      this.element.outerHTML = html;
      this.element = this.element.parentElement?.firstElementChild || null;
    }

    lifecycle.trigger('updated', this);
    this.onUpdated();
  }

  // 언마운트
  unmount() {
    if (!this.mounted) return;

    lifecycle.trigger('beforeUnmount', this);
    cleanupAllEffects(); // Effect cleanup

    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    this.mounted = false;
    lifecycle.trigger('unmounted', this);
  }

  // 생명주기 훅 (오버라이드 가능)
  onMounted() {}
  onUpdated() {}
}
```

---

### Step 4: 실전 예시 - 무한 스크롤 (2시간)

```javascript
// src/components/product/InfiniteProductList.js
import { Component } from '../../core/Component.js';
import { createEffect } from '../../core/hooks/useEffect.js';
import { getProducts } from '../../api/productApi.js';

export class InfiniteProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      page: 1,
      loading: false,
      hasMore: true
    };

    this.observer = null;
    this.sentinelRef = null;
  }

  onMounted() {
    // Intersection Observer 설정
    createEffect(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !this.state.loading && this.state.hasMore) {
            this.loadMore();
          }
        },
        { threshold: 0.5 }
      );

      // Sentinel 요소 관찰
      this.sentinelRef = this.element.querySelector('.sentinel');
      if (this.sentinelRef) {
        this.observer.observe(this.sentinelRef);
      }

      // Cleanup
      return () => {
        if (this.observer) {
          this.observer.disconnect();
        }
      };
    }, []);

    // 초기 데이터 로드
    this.loadMore();
  }

  async loadMore() {
    if (this.state.loading) return;

    this.state.loading = true;
    this.update();

    try {
      const data = await getProducts({
        page: this.state.page,
        limit: 20
      });

      this.state.products = [...this.state.products, ...data.products];
      this.state.page += 1;
      this.state.hasMore = data.products.length === 20;
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      this.state.loading = false;
      this.update();
    }
  }

  render() {
    return `
      <div class="infinite-product-list">
        <div class="product-grid">
          ${this.state.products.map(product => `
            <div class="product-card" data-id="${product.id}">
              <img src="${product.thumbnail}" alt="${product.title}">
              <h3>${product.title}</h3>
              <p>$${product.price}</p>
            </div>
          `).join('')}
        </div>

        ${this.state.loading ? `
          <div class="loading">Loading...</div>
        ` : ''}

        ${this.state.hasMore ? `
          <div class="sentinel"></div>
        ` : `
          <div class="end-message">모든 상품을 불러왔습니다.</div>
        `}
      </div>
    `;
  }
}
```

---

### Step 5: 실전 예시 - 실시간 검색 (1시간)

```javascript
// src/components/product/SearchForm.js
import { Component } from '../../core/Component.js';
import { createEffect } from '../../core/hooks/useEffect.js';
import { debounce } from '../../utils/debounce.js';
import { router } from '../../core/Router.js';

export class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: props.keyword || ''
    };
  }

  onMounted() {
    // 검색어 입력 이벤트
    const input = this.element.querySelector('.search-input');

    const handleSearch = debounce((value) => {
      this.state.keyword = value;
      router.updateQuery({ search: value || undefined });
    }, 300);

    input.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });

    // Cleanup
    createEffect(() => {
      return () => {
        input.removeEventListener('input', handleSearch);
      };
    }, []);
  }

  render() {
    return `
      <div class="search-form">
        <input
          type="text"
          class="search-input"
          placeholder="상품 검색..."
          value="${this.state.keyword}"
        >
        <button class="search-btn">검색</button>
      </div>
    `;
  }
}
```

---

### Step 6: 실전 예시 - 타이머 (30분)

```javascript
// src/components/common/Toast.js
import { Component } from '../../core/Component.js';
import { createEffect } from '../../core/hooks/useEffect.js';

export class Toast extends Component {
  constructor(props) {
    super(props);
    this.timerId = null;
  }

  onMounted() {
    const { duration = 3000, onClose } = this.props;

    // 자동 닫기 타이머
    createEffect(() => {
      this.timerId = setTimeout(() => {
        if (onClose) {
          onClose();
        }
        this.unmount();
      }, duration);

      // Cleanup
      return () => {
        if (this.timerId) {
          clearTimeout(this.timerId);
        }
      };
    }, []);
  }

  render() {
    const { message, type = 'info' } = this.props;

    return `
      <div class="toast toast-${type}">
        <span>${message}</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
          &times;
        </button>
      </div>
    `;
  }
}
```

---

## ✅ 체크리스트

### createEffect
- [ ] Effect 함수 실행
- [ ] 의존성 배열 변경 시에만 재실행
- [ ] Cleanup 함수 동작
- [ ] 메모리 누수 방지

### Lifecycle
- [ ] mounted 훅 동작
- [ ] updated 훅 동작
- [ ] unmounted 훅 동작
- [ ] 모든 이벤트 리스너 정리

### 실전 적용
- [ ] 무한 스크롤 동작
- [ ] 디바운싱된 검색 동작
- [ ] 타이머 자동 정리

---

## 🐛 디버깅 팁

### 문제 1: Effect가 무한 루프에 빠져요
```javascript
// ❌ 잘못된 코드 (의존성 배열 없음)
createEffect(() => {
  setState(newValue); // 매번 실행 → 무한 루프
});

// ✅ 올바른 코드
createEffect(() => {
  fetchData(); // 한 번만 실행
}, []);
```

### 문제 2: Cleanup이 실행되지 않아요
```javascript
// ❌ 잘못된 코드
createEffect(() => {
  const timerId = setTimeout(() => {}, 1000);
  // cleanup 함수 반환 안 함
}, []);

// ✅ 올바른 코드
createEffect(() => {
  const timerId = setTimeout(() => {}, 1000);

  return () => {
    clearTimeout(timerId); // cleanup
  };
}, []);
```

---

## 🎓 학습 포인트

### useEffect의 실행 시점

```
렌더링 → DOM 업데이트 → useEffect 실행
```

### 의존성 배열

- `[]` - 마운트 시 한 번만 실행
- `[dep]` - dep 변경 시 실행
- 없음 - 매 렌더링마다 실행

---

## 📖 추가 학습 자료

- [React - useEffect](https://react.dev/reference/react/useEffect)
- [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- [Intersection Observer API](https://developer.mozilla.org/ko/docs/Web/API/Intersection_Observer_API)

---

다음: **[05-VIRTUAL-DOM.md - Virtual DOM 구현하기](./05-VIRTUAL-DOM.md)** →
