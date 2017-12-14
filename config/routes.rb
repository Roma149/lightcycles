Lightcycles::Application.routes.draw do

  root to: "pages#home"

  resources :users, only: [:create, :destroy]

  get "/guest", to: "users#guest"

  get "/signup", to: "users#new"

  post "/users/update_stats", to: "users#update_stats"

  get "/scoreboard", to: "pages#scoreboard"

  # routes to handle sign in/out
  get "/login", to: "sessions#new"
  post "/login", to: "sessions#create"
  delete "/logout", to: "sessions#destroy"

end
