class User < ActiveRecord::Base

	validates :username, presence: true
	validates :password, presence: true, length: { minimum: 8 }
	validates :password_confirmation, presence: true

	before_save :create_remember_token

	has_secure_password

	def add_win
		self.wins += 1
	end

	def add_loss
		self.losses += 1
	end

	def add_draw
		self.draws += 1
	end

	private

	def create_remember_token
  		self.remember_token = SecureRandom.urlsafe_base64
	end

end
