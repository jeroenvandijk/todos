require 'spec_helper'
require 'yajl'

describe "api" do
  describe "GET /todos" do
    it "returns a json hash with the proper data" do
      get todos_path(:format => :json)
      response.status.should == 200
      Yajl::Parser.parse(response.body).length.should == 0
    end
  end

  describe "POST /todos" do
    it "requires title param" do
      post todos_path(:format => :json), :isDone => true
      response.status.should == 422
    end

    it "creates a new todo and loads all" do
      post todos_path(:format => :json), :title => "hello world"
      response.status.should >= 200
      body = Yajl::Parser.parse(response.body)
      body['isDone'].should == false
      body['title'].should == "hello world"
      get todos_path(:format => :json)
      response.status.should >= 200
      Yajl::Parser.parse(response.body).length.should == 1
    end
  end

  describe "PUT /todos/:id" do
    it "creates and updates a todo" do
      post todos_path(:format => :json), :title => "hello world"
      response.status.should >= 200
      todo_id = Yajl::Parser.parse(response.body)['id']
      put todo_path(todo_id, :format => :json), :title => "hello my world"
      response.status.should >= 200
      body = Yajl::Parser.parse(response.body)
      body['title'].should == "hello my world"
    end
  end
end
