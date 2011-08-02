class Todo < ActiveRecord::Base
  validates :title, :presence => {:only => :create}
  validates_length_of :title, :minimum => 3
end
