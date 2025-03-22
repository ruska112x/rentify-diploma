import { Provider } from 'react-redux'
import MainRouter from './MainRouter'
import { store } from '../state/store'
import { BrowserRouter } from 'react-router'

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <MainRouter />
      </BrowserRouter>
    </Provider>
  )
}

export default App
