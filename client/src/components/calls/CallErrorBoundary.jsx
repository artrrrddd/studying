import { Component } from 'react';
import { Link } from 'react-router-dom';
import s from './calls.module.css';

export default class CallErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className={s.page}>
          <div className={s.shell}>
            <section className={s.panel}>
              <h1>Комната звонка не открылась</h1>
              <p className={s.error}>
                {this.state.error?.message || 'Ошибка Daily UI'}
              </p>
              <Link to="/calls">
                <button className={s.secondaryButton} type="button">
                  Назад к звонкам
                </button>
              </Link>
            </section>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
