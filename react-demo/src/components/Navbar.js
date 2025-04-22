import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">学术助手</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">项目简介</Nav.Link>
            <Nav.Link href="/upload">上传文档</Nav.Link> {/* 新增这一行 */}
            <Nav.Link href="#overview">领域综述</Nav.Link>
            <Nav.Link href="#cards">知识卡片</Nav.Link>
            <Nav.Link href="#account">我的账户</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;