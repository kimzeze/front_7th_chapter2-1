# 06. 고급 Hooks 구현하기

> **React 개념**: useMemo, useCallback, useRef, useContext, Custom Hooks
> **난이도**: ⭐⭐⭐⭐ (어려움)
> **예상 시간**: 6-8시간

## 🎯 이번 단계의 목표

React의 고급 Hooks들을 직접 구현하고, Custom Hooks를 만듭니다.

### 구현할 기능
- ✅ `createMemo()` - useMemo와 유사
- ✅ `createCallback()` - useCallback과 유사
- ✅ `createRef()` - useRef와 유사
- ✅ `createContext()` - useContext와 유사
- ✅ Custom Hooks

---

## 🏗️ 구현 단계

### Step 1: useMemo 구현 (1.5시간)

**파일 생성**: `src/core/hooks/useMemo.js`

```javascript
const memos = [];
let currentMemoIndex = 0;

export function createMemo(factory, deps) {
  const memoIndex = currentMemoIndex;
  const oldMemo = memos[memoIndex];

  // 의존성 비교
  let hasChanged = true;
  if (oldMemo && oldMemo.deps) {
    hasChanged = deps.some((dep, i) => dep !== oldMemo.deps[i]);
  }

  if (hasChanged) {
    const value = factory(); // 계산 수행
    memos[memoIndex] = { value, deps };
  }

  currentMemoIndex++;
  return memos[memoIndex].value;
}

export function resetMemoIndex() {
  currentMemoIndex = 0;
}
```

**사용 예시**:
```javascript
// 비싼 연산 메모이제이션
const expensiveValue = createMemo(() => {
  console.log('Calculating...');
  return products
    .filter(p => p.price > 100)
    .sort((a, b) => b.price - a.price);
}, [products]);
```

---

### Step 2: useCallback 구현 (1시간)

**파일 생성**: `src/core/hooks/useCallback.js`

```javascript
import { createMemo } from './useMemo.js';

export function createCallback(callback, deps) {
  return createMemo(() => callback, deps);
}
```

**사용 예시**:
```javascript
// 함수 메모이제이션
const handleClick = createCallback((id) => {
  console.log('Clicked:', id);
  // ... 로직
}, [someDependency]);
```

---

### Step 3: useRef 구현 (1시간)

**파일 생성**: `src/core/hooks/useRef.js`

```javascript
const refs = [];
let currentRefIndex = 0;

export function createRef(initialValue) {
  const refIndex = currentRefIndex;

  if (!refs[refIndex]) {
    refs[refIndex] = { current: initialValue };
  }

  currentRefIndex++;
  return refs[refIndex];
}

export function resetRefIndex() {
  currentRefIndex = 0;
}
```

**사용 예시**:
```javascript
class SearchInput extends Component {
  constructor(props) {
    super(props);
    this.inputRef = createRef(null);
  }

  onMounted() {
    // DOM 참조 저장
    this.inputRef.current = this.element.querySelector('input');

    // 포커스
    this.inputRef.current.focus();
  }

  clear() {
    if (this.inputRef.current) {
      this.inputRef.current.value = '';
    }
  }

  render() {
    return `<input type="text" placeholder="Search...">`;
  }
}
```

---

### Step 4: useContext 구현 (2시간)

**파일 생성**: `src/core/hooks/useContext.js`

```javascript
export function createContext(defaultValue) {
  let currentValue = defaultValue;
  const subscribers = [];

  return {
    // Provider
    Provider: class Provider {
      constructor(value) {
        currentValue = value;
      }

      update(value) {
        currentValue = value;
        subscribers.forEach(callback => callback(value));
      }
    },

    // Consumer (구독)
    use() {
      return currentValue;
    },

    // 구독 함수
    subscribe(callback) {
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      };
    }
  };
}
```

**사용 예시**:
```javascript
// Context 생성
const ThemeContext = createContext('light');

// Provider 설정
const theme = new ThemeContext.Provider('dark');

// 컴포넌트에서 사용
class ThemedButton extends Component {
  constructor(props) {
    super(props);
    this.theme = ThemeContext.use();

    // 테마 변경 구독
    this.unsubscribe = ThemeContext.subscribe((newTheme) => {
      this.theme = newTheme;
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe();
  }

  render() {
    return `
      <button class="btn btn-${this.theme}">
        ${this.props.text}
      </button>
    `;
  }
}

// 테마 변경
theme.update('light');
```

---

### Step 5: Custom Hooks - useInfiniteScroll (1.5시간)

**파일 생성**: `src/hooks/useInfiniteScroll.js`

```javascript
import { createEffect } from '../core/hooks/useEffect.js';
import { createRef } from '../core/hooks/useRef.js';

export function useInfiniteScroll(callback, options = {}) {
  const { threshold = 0.5 } = options;
  const observerRef = createRef(null);
  const sentinelRef = createRef(null);

  createEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return sentinelRef;
}
```

**사용 예시**:
```javascript
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.sentinelRef = useInfiniteScroll(() => {
      this.loadMore();
    });
  }

  render() {
    return `
      <div>
        ${this.state.products.map(p => ProductCard(p)).join('')}
        <div class="sentinel" ref="${this.sentinelRef}"></div>
      </div>
    `;
  }
}
```

---

### Step 6: Custom Hooks - useDebounce (1시간)

**파일 생성**: `src/hooks/useDebounce.js`

```javascript
import { createRef } from '../core/hooks/useRef.js';
import { createEffect } from '../core/hooks/useEffect.js';

export function useDebounce(value, delay) {
  const timeoutRef = createRef(null);
  const debouncedValueRef = createRef(value);

  createEffect(() => {
    timeoutRef.current = setTimeout(() => {
      debouncedValueRef.current = value;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValueRef;
}
```

---

### Step 7: Custom Hooks - useLocalStorage (1시간)

**파일 생성**: `src/hooks/useLocalStorage.js`

```javascript
export function useLocalStorage(key, initialValue) {
  // 초기값 가져오기
  const storedValue = localStorage.getItem(key);
  let value = storedValue ? JSON.parse(storedValue) : initialValue;

  // 값 업데이트 함수
  const setValue = (newValue) => {
    try {
      const valueToStore = typeof newValue === 'function'
        ? newValue(value)
        : newValue;

      value = valueToStore;
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // 값 제거 함수
  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      value = initialValue;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  };

  return [value, setValue, removeValue];
}
```

**사용 예시**:
```javascript
// 장바구니를 localStorage에 저장
const [cart, setCart, clearCart] = useLocalStorage('cart', []);

// 아이템 추가
setCart([...cart, newItem]);

// 장바구니 비우기
clearCart();
```

---

## ✅ 체크리스트

### 기본 Hooks
- [ ] useMemo 동작
- [ ] useCallback 동작
- [ ] useRef 동작
- [ ] useContext 동작

### Custom Hooks
- [ ] useInfiniteScroll 동작
- [ ] useDebounce 동작
- [ ] useLocalStorage 동작

---

## 🎓 학습 포인트

### Hook 규칙

1. **최상위에서만 호출**
```javascript
// ❌ 조건문 안에서 호출
if (condition) {
  const value = createMemo(() => {}, []);
}

// ✅ 최상위에서 호출
const value = createMemo(() => {
  if (condition) {
    return something;
  }
  return defaultValue;
}, [condition]);
```

2. **순서 유지**
```javascript
// Hook은 항상 같은 순서로 호출되어야 함
const value1 = createMemo(() => {}, []);
const value2 = createMemo(() => {}, []); // 순서 바뀌면 안 됨
```

---

## 📖 추가 학습 자료

- [React - useMemo](https://react.dev/reference/react/useMemo)
- [React - useCallback](https://react.dev/reference/react/useCallback)
- [React - useRef](https://react.dev/reference/react/useRef)
- [React - useContext](https://react.dev/reference/react/useContext)
- [Writing Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

다음: **[07-OPTIMIZATION.md - 최적화 기법](./07-OPTIMIZATION.md)** →
