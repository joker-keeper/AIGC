import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Home = () => {
  return (
    <Container>
      <h1 className="mt-4">欢迎来到学术助手平台</h1>
      <p>我们的平台帮助您更轻松地进入学术领域，轻松读懂论文。</p>
      <Row className="mt-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>项目简介</Card.Title>
              <Card.Text>
                这里展示平台的基本功能和使用方法，帮助用户了解平台的服务内容。
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>上传文档</Card.Title>
              <Card.Text>
                用户可以上传PDF文献，系统会自动处理并展示相关领域信息。
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>领域综述</Card.Title>
              <Card.Text>
                平台将为您提供详细的领域综述，帮助您快速了解当前领域的研究热点和挑战。
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
