Todos::Application.routes.draw do
  resources :todos, :except => [:new, :edit]
  root :to => 'todos#index'
end
